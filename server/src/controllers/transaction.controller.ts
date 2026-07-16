import type { RequestHandler } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { updateTransactionSchema } from "../validators/transaction.validator.js";

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

// Centralized audit creation. Called inside a Prisma transaction so the mutation
// and its audit log either both succeed or both fail.
const recordAudit = (
  tx: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    action: "CREATE" | "UPDATE" | "DELETE";
    transactionId: string;
    userId: string;
    previousValue: TransactionSnapshot | null;
    newValue: TransactionSnapshot;
  },
) =>
  tx.auditLog.create({
    data: {
      workspaceId: input.workspaceId,
      action: input.action,
      transactionId: input.transactionId,
      userId: input.userId,
      previousValue: input.previousValue ?? undefined,
      newValue: input.newValue,
    },
  });

// ── GET /transactions?workspaceId=xxx ─────────────────────────────────────────
export const getTransactions: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId || typeof workspaceId !== "string") {
      return res.status(400).json({ success: false, message: "workspaceId query parameter is required" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { workspaceId, deletedAt: null },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    });

    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};

// ── PUT /transactions/:id ─────────────────────────────────────────────────────
export const updateTransaction: RequestHandler = async (req, res) => {
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
        where: { id },
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
    console.error("updateTransaction error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ success: false, message: "Failed to update transaction" });
  }
};

// ── DELETE /transactions/:id (soft delete) ────────────────────────────────────
export const deleteTransaction: RequestHandler = async (req, res) => {
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
        where: { id },
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
    console.error("deleteTransaction error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ success: false, message: "Failed to delete transaction" });
  }
};

// ── POST /transactions ────────────────────────────────────────────────────────
export const addTransaction: RequestHandler = async (req, res) => {
  try {
    const { title, description, amount, type, transactionDate, createdById, workspaceId } = req.body;

    // Validate workspace exists
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "workspaceId is required" });
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    // Validate creator
    const existingUser = createdById
      ? await prisma.user.findUnique({ where: { id: createdById } })
      : null;

    if (!existingUser) {
      return res.status(400).json({ success: false, message: "Invalid createdById" });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          title,
          ...(description !== undefined ? { description } : {}),
          amount: Number(amount),
          type,
          transactionDate: new Date(transactionDate),
          createdById: existingUser.id,
          workspaceId,
        },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      });

      await recordAudit(tx, {
        workspaceId: created.workspaceId,
        action: "CREATE",
        transactionId: created.id,
        userId: existingUser.id,
        previousValue: null,
        newValue: toSnapshot(created),
      });

      return created;
    });

    return res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error("addTransaction error:", error instanceof Error ? error.message : error);
    return res.status(500).json({
      success: false,
      message: "Failed to add transaction",
      error: error instanceof Error ? error.message : error,
    });
  }
};
