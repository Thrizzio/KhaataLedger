import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";

// ── GET /transactions?workspaceId=xxx ─────────────────────────────────────────
export const getTransactions: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId || typeof workspaceId !== "string") {
      return res.status(400).json({ success: false, message: "workspaceId query parameter is required" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { workspaceId },
      include: { category: true, createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    });

    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};

// ── POST /transactions ────────────────────────────────────────────────────────
export const addTransaction: RequestHandler = async (req, res) => {
  try {
    const { title, description, amount, type, transactionDate, categoryId, createdById, workspaceId } = req.body;

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

    // Resolve or create category
    let resolvedCategoryId: string | null = null;
    if (categoryId) {
      const lookup = String(categoryId).trim();
      const existingCategory = await prisma.category.findFirst({
        where: {
          workspaceId,
          OR: [
            { name: { equals: lookup, mode: "insensitive" } },
            { id: lookup },
          ],
        },
      });

      if (existingCategory) {
        resolvedCategoryId = existingCategory.id;
      } else {
        const created = await prisma.category.create({
          data: { name: lookup, defaultType: type, workspaceId },
        });
        resolvedCategoryId = created.id;
      }
    }

    // category is required in schema — reject if none resolved
    if (!resolvedCategoryId) {
      return res.status(400).json({ success: false, message: "A valid category is required" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        ...(description !== undefined ? { description } : {}),
        amount: Number(amount),
        type,
        transactionDate: new Date(transactionDate),
        categoryId: resolvedCategoryId,
        createdById: existingUser.id,
        workspaceId,
      },
      include: { category: true, createdBy: { select: { id: true, name: true, email: true } } },
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