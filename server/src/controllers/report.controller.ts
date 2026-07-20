import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { getReports, REPORT_RANGES, type ReportRange } from "../services/report.service.js";

export const getReportsHandler: RequestHandler = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "Workspace id is required" });
    }

    const rangeParam = typeof req.query.range === "string" ? req.query.range : "thisMonth";
    if (!REPORT_RANGES.includes(rangeParam as ReportRange)) {
      return res.status(400).json({ success: false, message: "Invalid range" });
    }
    const range = rangeParam as ReportRange;
    const startDate = typeof req.query.startDate === "string" ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === "string" ? req.query.endDate : undefined;

    if (range === "custom" && (!startDate || !endDate)) {
      return res
        .status(400)
        .json({ success: false, message: "startDate and endDate are required for a custom range" });
    }

    // Verify the caller owns or belongs to the requested workspace (never trust workspaceId).
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found" });
    }
    if (req.user!.role === "OWNER" && workspace.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: "You do not have access to this workspace" });
    }
    if (req.user!.role === "EMPLOYEE") {
      const employee = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { workspaceId: true },
      });
      if (employee?.workspaceId !== workspaceId) {
        return res.status(403).json({ success: false, message: "You do not have access to this workspace" });
      }
    }

    const data = await getReports({ workspaceId, range, startDate, endDate });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getReports error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate reports" });
  }
};
