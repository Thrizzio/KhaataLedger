import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { updateTransactionSchema } from "../validators/transaction.validator.js";

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

    const parsed = updateTransactionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parsed.error.flatten(),
      });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.deletedAt) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Only the owner of the transaction's workspace may edit it.
    const workspace = await prisma.workspace.findUnique({ where: { id: transaction.workspaceId } });
    if (!workspace || workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You do not have permission to edit this transaction" });
    }

    const { title, description, amount, type, transactionDate } = parsed.data;

    const updated = await prisma.transaction.update({
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

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction || transaction.deletedAt) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Only the owner of the transaction's workspace may delete it.
    const workspace = await prisma.workspace.findUnique({ where: { id: transaction.workspaceId } });
    if (!workspace || workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You do not have permission to delete this transaction" });
    }

    const deleted = await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
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


    const transaction = await prisma.transaction.create({
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