import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";

// get all transactions.

export const getTransactions: RequestHandler = async (_req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
        createdBy: true,
      },
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

// add a new transaction.

export const addTransaction: RequestHandler = async (req, res) => {
  try {
    console.log("========== ADD TRANSACTION ==========");
    console.log("Request Body:", req.body);

    const { title, description, amount, type, transactionDate, categoryId, createdById } = req.body;

    const existingUser = createdById
      ? await prisma.user.findUnique({ where: { id: createdById } })
      : null;

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid createdById" });
    }

    let resolvedCategoryId = categoryId;

    if (categoryId) {
      const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });

      if (!existingCategory) {
        const createdCategory = await prisma.category.create({
          data: {
            name: String(categoryId),
            defaultType: type,
          },
        });

        resolvedCategoryId = createdCategory.id;
      } else {
        resolvedCategoryId = existingCategory.id;
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        ...(description !== undefined ? { description } : {}),
        amount,
        type,
        transactionDate: new Date(transactionDate),
        categoryId: resolvedCategoryId,
        createdById: existingUser.id,
      },
    });

    console.log("Transaction Created:", transaction);

    return res.status(201).json(transaction);
  } catch (error) {
    console.error("========== ADD TRANSACTION ERROR ==========");
    console.error(error);

    return res.status(500).json({
      message: "Failed to add transaction",
      error: error instanceof Error ? error.message : error,
    });
  }
};