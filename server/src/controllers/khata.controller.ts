import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";

// ── GET /khata?workspaceId=xxx ───────────────────────────────────────────────
export const getKhatas: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId || typeof workspaceId !== "string") {
      return res.status(400).json({ success: false, message: "workspaceId query parameter is required" });
    }

    const khatas = await prisma.khata.findMany({
      where: { workspaceId },
      include: {
        entries: {
          select: { amount: true, type: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Calculate pending amount dynamically
    const data = khatas.map((khata) => {
      let pendingAmount = Number(khata.initialAmount);
      for (const entry of khata.entries) {
        if (entry.type === "CREDIT") {
          pendingAmount += Number(entry.amount);
        } else if (entry.type === "PAYMENT") {
          pendingAmount -= Number(entry.amount);
        }
      }
      
      const { entries, ...rest } = khata;
      return {
        ...rest,
        pendingAmount,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getKhatas error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch Khatas" });
  }
};

// ── POST /khata ─────────────────────────────────────────────────────────────
export const createKhata: RequestHandler = async (req, res) => {
  try {
    const { workspaceId, customerName, contactNumber, title, initialAmount, createdById } = req.body;

    if (!workspaceId || !customerName || !title || initialAmount === undefined || !createdById) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if khata already exists for this customer in this workspace
    const existingKhata = await prisma.khata.findUnique({
      where: {
        workspaceId_customerName: {
          workspaceId,
          customerName,
        }
      }
    });

    if (existingKhata) {
      return res.status(200).json({ success: true, data: existingKhata, message: "Khata already exists for this customer" });
    }

    const khata = await prisma.khata.create({
      data: {
        workspaceId,
        customerName,
        contactNumber: contactNumber || "",
        title,
        initialAmount: Number(initialAmount),
        createdById,
      }
    });

    return res.status(201).json({ success: true, data: khata });
  } catch (error) {
    console.error("createKhata error:", error);
    return res.status(500).json({ success: false, message: "Failed to create Khata" });
  }
};

// ── GET /khata/:id ──────────────────────────────────────────────────────────
export const getKhataDetails: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const khata = await prisma.khata.findUnique({
      where: { id },
      include: {
        entries: {
          select: { amount: true, type: true }
        }
      }
    });

    if (!khata) {
      return res.status(404).json({ success: false, message: "Khata not found" });
    }

    let pendingAmount = Number(khata.initialAmount);
    for (const entry of khata.entries) {
      if (entry.type === "CREDIT") {
        pendingAmount += Number(entry.amount);
      } else if (entry.type === "PAYMENT") {
        pendingAmount -= Number(entry.amount);
      }
    }

    const { entries, ...rest } = khata;
    return res.status(200).json({ success: true, data: { ...rest, pendingAmount } });
  } catch (error) {
    console.error("getKhataDetails error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch Khata details" });
  }
};

// ── PUT /khata/:id ──────────────────────────────────────────────────────────
export const updateKhata: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, contactNumber, initialAmount } = req.body;

    const khata = await prisma.khata.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(contactNumber !== undefined && { contactNumber }),
        ...(initialAmount !== undefined && { initialAmount: Number(initialAmount) }),
      }
    });

    return res.status(200).json({ success: true, data: khata });
  } catch (error) {
    console.error("updateKhata error:", error);
    return res.status(500).json({ success: false, message: "Failed to update Khata" });
  }
};

// ── GET /khata/:id/entries ──────────────────────────────────────────────────
export const getKhataEntries: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const entries = await prisma.khataEntry.findMany({
      where: { khataId: id },
      orderBy: { entryDate: "desc" },
      include: { createdBy: { select: { name: true } } }
    });

    return res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error("getKhataEntries error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch Khata entries" });
  }
};

// ── POST /khata/:id/entries ─────────────────────────────────────────────────
export const addKhataEntry: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, entryDate, createdById } = req.body;

    if (!title || amount === undefined || !type || !entryDate || !createdById) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const entry = await prisma.khataEntry.create({
      data: {
        khataId: id,
        title,
        amount: Number(amount),
        type,
        entryDate: new Date(entryDate),
        createdById,
      }
    });

    // Update Khata updatedAt timestamp
    await prisma.khata.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    return res.status(201).json({ success: true, data: entry });
  } catch (error) {
    console.error("addKhataEntry error:", error);
    return res.status(500).json({ success: false, message: "Failed to add Khata entry" });
  }
};

// ── DELETE /khata/:id ───────────────────────────────────────────────────────
export const deleteKhata: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.khata.delete({
      where: { id }
    });

    return res.status(200).json({ success: true, message: "Khata deleted successfully" });
  } catch (error) {
    console.error("deleteKhata error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete Khata" });
  }
};
