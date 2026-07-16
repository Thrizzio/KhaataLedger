import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  getKhatas,
  createKhata,
  updateKhata,
  getKhataDetails,
  getKhataEntries,
  addKhataEntry,
  deleteKhata,
} from "../controllers/khata.controller.js";

export const khataRouter = Router();

// GET /api/khata?workspaceId=xxx
khataRouter.get("/", authenticate, getKhatas);

// POST /api/khata (owner only)
khataRouter.post("/", authenticate, authorizeRoles("OWNER"), createKhata);

// GET /api/khata/:id
khataRouter.get("/:id", authenticate, getKhataDetails);

// PUT /api/khata/:id (owner only)
khataRouter.put("/:id", authenticate, authorizeRoles("OWNER"), updateKhata);

// DELETE /api/khata/:id (owner only, soft delete)
khataRouter.delete("/:id", authenticate, authorizeRoles("OWNER"), deleteKhata);

// GET /api/khata/:id/entries
khataRouter.get("/:id/entries", authenticate, getKhataEntries);

// POST /api/khata/:id/entries (owner only)
khataRouter.post("/:id/entries", authenticate, authorizeRoles("OWNER"), addKhataEntry);
