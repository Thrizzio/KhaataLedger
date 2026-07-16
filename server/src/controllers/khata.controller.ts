import type { RequestHandler } from "express";
import type { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import {
  createKhataSchema,
  updateKhataSchema,
  addKhataEntrySchema,
} from "../validators/khata.validator.js";

// ── Workspace access helper ──────────────────────────────────────────────────
// Returns null when the caller may access the workspace, otherwise a denial.
type AuthUser = { id: string; role: Role };
type Denial = { status: number; message: string };

const checkWorkspace = async (workspaceId: string, user: AuthUser): Promise<Denial | null> => {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return { status: 404, message: "Workspace not found" };
  if (user.role === "OWNER" && ws.ownerId !== user.id) {
    return { status: 403, message: "You do not have access to this workspace" };
  }
  if (user.role === "EMPLOYEE") {
    const employee = await prisma.user.findUnique({
      where: { id: user.id },
      select: { workspaceId: true },
    });
    if (employee?.workspaceId !== workspaceId) {
      return { status: 403, message: "You do not have access to this workspace" };
    }
  }
  return null;
};

// ── Audit snapshot helper (Khata) ────────────────────────────────────────────
type KhataSnapshot = {
  id: string;
  customerName: string;
  contactNumber: string;
  title: string;
  initialAmount: number;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const toKhataSnapshot = (k: {
  id: string;
  customerName: string;
  contactNumber: string;
  title: string;
  initialAmount: Prisma.Decimal | number;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): KhataSnapshot => ({
  id: k.id,
  customerName: k.customerName,
  contactNumber: k.contactNumber,
  title: k.title,
  initialAmount: typeof k.initialAmount === "number" ? k.initialAmount : Number(k.initialAmount),
  workspaceId: k.workspaceId,
  createdById: k.createdById,
  createdAt: k.createdAt.toISOString(),
  updatedAt: k.updatedAt.toISOString(),
  deletedAt: k.deletedAt ? k.deletedAt.toISOString() : null,
});

// Centralized khata audit creation, called inside a Prisma transaction.
const recordKhataAudit = (
  tx: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    action: "CREATE" | "UPDATE" | "DELETE";
    khataId: string;
    userId: string;
    previousValue: Prisma.InputJsonValue | null;
    newValue: Prisma.InputJsonValue | null;
  },
) =>
  tx.auditLog.create({
    data: {
      workspaceId: input.workspaceId,
      action: input.action,
      khataId: input.khataId,
      userId: input.userId,
      previousValue: input.previousValue ?? undefined,
      newValue: input.newValue ?? undefined,
    },
  });

// ── GET /khata?workspaceId=xxx ───────────────────────────────────────────────
export const getKhatas: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId || typeof workspaceId !== "string") {
      return res.status(400).json({ success: false, message: "workspaceId query parameter is required" });
    }

    const denied = await checkWorkspace(workspaceId, req.user!);
    if (denied) return res.status(denied.status).json({ success: false, message: denied.message });

    const khatas = await prisma.khata.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        entries: { where: { deletedAt: null }, select: { amount: true, type: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const data = khatas.map((khata) => {
      let pendingAmount = Number(khata.initialAmount);
      for (const entry of khata.entries) {
        if (entry.type === "CREDIT") pendingAmount += Number(entry.amount);
        else if (entry.type === "PAYMENT") pendingAmount -= Number(entry.amount);
      }
      const { entries, ...rest } = khata;
      return { ...rest, pendingAmount };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getKhatas error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch Khatas" });
  }
};

// ── POST /khata (owner only) ─────────────────────────────────────────────────
export const createKhata: RequestHandler = async (req, res) => {
  try {
    const parsed = createKhataSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Validation failed", error: parsed.error.flatten() });
    }
    const { workspaceId, customerName, contactNumber, title, initialAmount } = parsed.data;

    const denied = await checkWorkspace(workspaceId, req.user!);
    if (denied) return res.status(denied.status).json({ success: false, message: denied.message });

    const existingKhata = await prisma.khata.findUnique({
      where: { workspaceId_customerName: { workspaceId, customerName } },
    });
    if (existingKhata) {
      return res.status(200).json({ success: true, data: existingKhata, message: "Khata already exists for this customer" });
    }

    const khata = await prisma.$transaction(async (tx) => {
      const created = await tx.khata.create({
        data: {
          workspaceId,
          customerName,
          contactNumber,
          title,
          initialAmount: Number(initialAmount),
          createdById: req.user!.id,
        },
      });
      await recordKhataAudit(tx, {
        workspaceId,
        action: "CREATE",
        khataId: created.id,
        userId: req.user!.id,
        previousValue: null,
        newValue: toKhataSnapshot(created),
      });
      return created;
    });

    return res.status(201).json({ success: true, data: khata });
  } catch (error) {
    console.error("createKhata error:", error);
    return res.status(500).json({ success: false, message: "Failed to create Khata" });
  }
};

// ── GET /khata/:id ───────────────────────────────────────────────────────────
export const getKhataDetails: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Khata id is required" });
    }
    const khata = await prisma.khata.findUnique({
      where: { id },
      include: { entries: { where: { deletedAt: null }, select: { amount: true, type: true } } },
    });
    if (!khata || khata.deletedAt) {
      return res.status(404).json({ success: false, message: "Khata not found" });
    }

    const denied = await checkWorkspace(khata.workspaceId, req.user!);
    if (denied) return res.status(denied.status).json({ success: false, message: denied.message });

    let pendingAmount = Number(khata.initialAmount);
    for (const entry of khata.entries) {
      if (entry.type === "CREDIT") pendingAmount += Number(entry.amount);
      else if (entry.type === "PAYMENT") pendingAmount -= Number(entry.amount);
    }
    const { entries, ...rest } = khata;
    return res.status(200).json({ success: true, data: { ...rest, pendingAmount } });
  } catch (error) {
    console.error("getKhataDetails error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch Khata details" });
  }
};

// ── PUT /khata/:id (owner only) ──────────────────────────────────────────────
export const updateKhata: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Khata id is required" });
    }
    const parsed = updateKhataSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Validation failed", error: parsed.error.flatten() });
    }
    const { customerName, contactNumber, initialAmount } = parsed.data;

    const before = await prisma.khata.findUnique({ where: { id } });
    if (!before || before.deletedAt) {
      return res.status(404).json({ success: false, message: "Khata not found" });
    }

    const denied = await checkWorkspace(before.workspaceId, req.user!);
    if (denied) return res.status(denied.status).json({ success: false, message: denied.message });

    const updated = await prisma.$transaction(async (tx) => {
      const after = await tx.khata.update({
        where: { id },
        data: {
          ...(customerName !== undefined && { customerName }),
          ...(contactNumber !== undefined && { contactNumber }),
          ...(initialAmount !== undefined && { initialAmount: Number(initialAmount) }),
        },
      });
      await recordKhataAudit(tx, {
        workspaceId: after.workspaceId,
        action: "UPDATE",
        khataId: after.id,
        userId: req.user!.id,
        previousValue: toKhataSnapshot(before),
        newValue: toKhataSnapshot(after),
      });
      return after;
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateKhata error:", error);
    return res.status(500).json({ success: false, message: "Failed to update Khata" });
  }
};

// ── GET /khata/:id/entries ───────────────────────────────────────────────────
export const getKhataEntries: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Khata id is required" });
    }
    const khata = await prisma.khata.findUnique({
      where: { id },
      select: { id: true, workspaceId: true, deletedAt: true },
    });
    if (!khata || khata.deletedAt) {
      return res.status(404).json({ success: false, message: "Khata not found" });
    }

    const denied = await checkWorkspace(khata.workspaceId, req.user!);
    if (denied) return res.status(denied.status).json({ success: false, message: denied.message });

    const entries = await prisma.khataEntry.findMany({
      where: { khataId: id, deletedAt: null },
      orderBy: { entryDate: "desc" },
      include: { createdBy: { select: { name: true } } },
    });

    return res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error("getKhataEntries error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch Khata entries" });
  }
};

// ── POST /khata/:id/entries (owner only) ─────────────────────────────────────
export const addKhataEntry: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Khata id is required" });
    }
    const parsed = addKhataEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Validation failed", error: parsed.error.flatten() });
    }
    const { title, amount, type, entryDate } = parsed.data;

    const khata = await prisma.khata.findUnique({ where: { id } });
    if (!khata || khata.deletedAt) {
      return res.status(404).json({ success: false, message: "Khata not found" });
    }

    const denied = await checkWorkspace(khata.workspaceId, req.user!);
    if (denied) return res.status(denied.status).json({ success: false, message: denied.message });

    const entry = await prisma.$transaction(async (tx) => {
      const created = await tx.khataEntry.create({
        data: {
          khataId: id,
          title,
          amount: Number(amount),
          type,
          entryDate: new Date(entryDate),
          createdById: req.user!.id,
        },
      });
      await tx.khata.update({ where: { id }, data: { updatedAt: new Date() } });
      await recordKhataAudit(tx, {
        workspaceId: khata.workspaceId,
        action: "CREATE",
        khataId: khata.id,
        userId: req.user!.id,
        previousValue: null,
        newValue: {
          entryId: created.id,
          title: created.title,
          amount: Number(created.amount),
          type: created.type,
          entryDate: created.entryDate.toISOString(),
        },
      });
      return created;
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error("addKhataEntry error:", error);
    return res.status(500).json({ success: false, message: "Failed to add Khata entry" });
  }
};

// ── DELETE /khata/:id (owner only, soft delete) ──────────────────────────────
export const deleteKhata: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Khata id is required" });
    }

    const before = await prisma.khata.findUnique({ where: { id } });
    if (!before || before.deletedAt) {
      return res.status(404).json({ success: false, message: "Khata not found" });
    }

    const denied = await checkWorkspace(before.workspaceId, req.user!);
    if (denied) return res.status(denied.status).json({ success: false, message: denied.message });

    await prisma.$transaction(async (tx) => {
      // Soft-delete the khata and all of its entries together.
      await tx.khataEntry.updateMany({
        where: { khataId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      });
      await tx.khata.update({ where: { id }, data: { deletedAt: new Date() } });
      await recordKhataAudit(tx, {
        workspaceId: before.workspaceId,
        action: "DELETE",
        khataId: before.id,
        userId: req.user!.id,
        previousValue: toKhataSnapshot(before),
        newValue: null,
      });
    });

    return res.status(200).json({ success: true, message: "Khata deleted successfully" });
  } catch (error) {
    console.error("deleteKhata error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete Khata" });
  }
};
