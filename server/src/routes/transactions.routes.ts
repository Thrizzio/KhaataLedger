import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transaction.controller.js";
import { placeholderController } from "../controllers/placeholder.controller.js";

export const transactionsRouter = Router();

// Get all transactions
transactionsRouter.get("/", authenticate, getTransactions);

// Add a new transaction
transactionsRouter.post("/", authenticate, addTransaction);

// Keep this as a placeholder for now
transactionsRouter.get("/:id", authenticate, placeholderController);

// Update a transaction (owners only)
transactionsRouter.put(
  "/:id",
  authenticate,
  authorizeRoles("OWNER"),
  updateTransaction,
);

// Soft-delete a transaction (owners only)
transactionsRouter.delete(
  "/:id",
  authenticate,
  authorizeRoles("OWNER"),
  deleteTransaction,
);
