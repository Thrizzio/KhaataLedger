import { Router } from "express";
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
khataRouter.get("/", getKhatas);

// POST /api/khata
khataRouter.post("/", createKhata);

// GET /api/khata/:id
khataRouter.get("/:id", getKhataDetails);

// PUT /api/khata/:id
khataRouter.put("/:id", updateKhata);

// DELETE /api/khata/:id
khataRouter.delete("/:id", deleteKhata);

// GET /api/khata/:id/entries
khataRouter.get("/:id/entries", getKhataEntries);

// POST /api/khata/:id/entries
khataRouter.post("/:id/entries", addKhataEntry);
