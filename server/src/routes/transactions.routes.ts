import { Router } from "express";
import { addTransaction, getTransactions } from "../controllers/transaction.controller.js";
import { placeholderController } from "../controllers/placeholder.controller.js";

export const transactionsRouter = Router();

// Get all transactions
transactionsRouter.get("/", getTransactions);

// Add a new transaction
transactionsRouter.post("/", addTransaction);

// Keep these as placeholders for now
transactionsRouter.get("/:id", placeholderController);
transactionsRouter.patch("/:id", placeholderController);
transactionsRouter.delete("/:id", placeholderController);
