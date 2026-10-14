import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";

// ── GET /audit?workspaceId=xxx ────────────────────────────────────────────────
export const getAuditLogs: RequestHandler = async (req, res, next) => {
  try {
    const { workspaceId, entityType, entityId } = req.query;

    if (!workspaceId || typeof workspaceId !== "string") {
      return res.status(400).json({ success: false, message: "workspaceId query parameter is required" });
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    // Owners may access workspaces they own; employees only their assigned one.
    if (req.user!.role === "OWNER" && workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user!.role === "EMPLOYEE") {
      const employee = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { workspaceId: true },
      });
      if (employee?.workspaceId !== workspaceId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const whereClause: any = { workspaceId };
    if (entityType && typeof entityType === "string") whereClause.entityType = entityType;
    if (entityId && typeof entityId === "string") whereClause.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        transaction: { select: { title: true } },
        khata: { select: { id: true, customerName: true, title: true } },
        workspace: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: logs, message: "Audit logs fetched successfully" });
  } catch (error) {
    next(error);
  }
};

// ── GET /audit/:id ────────────────────────────────────────────────────────────
export const getAuditLogById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        transaction: { select: { title: true } },
        khata: { select: { id: true, customerName: true, title: true } },
        workspace: { select: { id: true, name: true } },
      },
    });

    if (!log) {
      return res.status(404).json({ success: false, message: "Audit log not found" });
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: log.workspaceId } });
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }

    if (req.user!.role === "OWNER" && workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user!.role === "EMPLOYEE") {
      const employee = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { workspaceId: true },
      });
      if (employee?.workspaceId !== log.workspaceId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    return res.status(200).json({ success: true, data: log, message: "Audit log fetched successfully" });
  } catch (error) {
    next(error);
  }
};
