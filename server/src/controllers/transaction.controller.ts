import type { RequestHandler } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { updateTransactionSchema, createTransactionSchema } from "../validators/transaction.validator.js";

// ── Snapshot helper ───────────────────────────────────────────────────────────
// Immutable, serializable capture of a transaction's scalar fields. Stored as
// JSON in AuditLog so future versions can compute diffs without re-querying.
type TransactionSnapshot = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  type: "INCOME" | "EXPENSE";
  transactionDate: string;
  workspaceId: string;
  createdById: string;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const toSnapshot = (t: {
  id: string;
  title: string;
  description: string | null;
  amount: Prisma.Decimal | number;
  type: "INCOME" | "EXPENSE";
  transactionDate: Date;
  workspaceId: string;
  createdById: string;
  version: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): TransactionSnapshot => ({
  id: t.id,
  title: t.title,
  description: t.description,
  amount: typeof t.amount === "number" ? t.amount : Number(t.amount),
  type: t.type,
  transactionDate: t.transactionDate.toISOString(),
  workspaceId: t.workspaceId,
  createdById: t.createdById,
  version: t.version,
  deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
});

import { recordAudit } from "../utils/audit.util.js";

// ── GET /transactions?workspaceId=xxx ─────────────────────────────────────────
export const getTransactions: RequestHandler = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId || typeof workspaceId !== "string") {
      return res.status(400).json({ success: false, message: "workspaceId query parameter is required" });
    }

    // Verify the caller belongs to (or owns) the requested workspace.
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }
    if (req.user!.role === "OWNER" && workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You do not have access to this workspace" });
    }
    if (req.user!.role === "EMPLOYEE") {
      if (req.user!.workspaceId !== workspaceId) {
        return res.status(403).json({ success: false, message: "You do not have access to this workspace" });
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: { workspaceId, deletedAt: null },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    });

    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// ── PUT /transactions/:id ─────────────────────────────────────────────────────
export const updateTransaction: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Transaction id is required" });
    }

    const parsed = updateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parsed.error.flatten(),
      });
    }

    const before = await prisma.transaction.findUnique({ where: { id } });
    if (!before || before.deletedAt) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Only the owner of the transaction's workspace may edit it.
    const workspace = await prisma.workspace.findUnique({ where: { id: before.workspaceId } });
    if (!workspace || workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You do not have permission to edit this transaction" });
    }

    const { title, description, amount, type, transactionDate } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const after = await tx.transaction.update({
        where: { id, version: before.version },
        data: {
          title,
          description: description ?? null,
          amount: Number(amount),
          type,
          transactionDate: new Date(transactionDate),
          version: { increment: 1 },
        },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      });

      await recordAudit(tx, {
        workspaceId: after.workspaceId,
        action: "UPDATE",
        transactionId: id,
        userId: req.user!.id,
        previousValue: toSnapshot(before),
        newValue: toSnapshot(after),
      });

      return after;
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /transactions/:id (soft delete) ────────────────────────────────────
export const deleteTransaction: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Transaction id is required" });
    }

    const before = await prisma.transaction.findUnique({ where: { id } });
    if (!before || before.deletedAt) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Only the owner of the transaction's workspace may delete it.
    const workspace = await prisma.workspace.findUnique({ where: { id: before.workspaceId } });
    if (!workspace || workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You do not have permission to delete this transaction" });
    }

    const deleted = await prisma.$transaction(async (tx) => {
      const after = await tx.transaction.update({
        where: { id, version: before.version },
        data: { deletedAt: new Date() },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      });

      await recordAudit(tx, {
        workspaceId: after.workspaceId,
        action: "DELETE",
        transactionId: id,
        userId: req.user!.id,
        previousValue: toSnapshot(before),
        newValue: toSnapshot(after),
      });

      return after;
    });

    return res.status(200).json({ success: true, data: deleted, message: "Transaction deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ── POST /transactions ────────────────────────────────────────────────────────
export const addTransaction: RequestHandler = async (req, res, next) => {
  try {
    const parsed = createTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parsed.error.flatten(),
      });
    }

    const { title, description, amount, type, transactionDate, workspaceId } = parsed.data;

    // Verify the caller belongs to (or owns) the target workspace.
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }
    if (req.user!.role === "OWNER" && workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You do not have access to this workspace" });
    }
    if (req.user!.role === "EMPLOYEE") {
      if (req.user!.workspaceId !== workspaceId) {
        return res.status(403).json({ success: false, message: "You do not have access to this workspace" });
      }
    }

    // Creator is always the authenticated user — never trusted from the body.
    const createdById = req.user!.id;

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          title,
          ...(description !== undefined ? { description } : {}),
          amount: Number(amount),
          type,
          transactionDate: new Date(transactionDate),
          createdById,
          workspaceId,
        },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      });

      await recordAudit(tx, {
        workspaceId: created.workspaceId,
        action: "CREATE",
        transactionId: created.id,
        userId: createdById,
        previousValue: null,
        newValue: toSnapshot(created),
      });

      return created;
    });

    return res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};
