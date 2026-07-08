import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";

// get all transactions.

export const getTransactions: RequestHandler = async (_req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        customer: true,
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
    const { amount, type, customerId, createdById } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        customerId,
        createdById,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Failed to add transaction" });
  }
};