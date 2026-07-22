import { Router } from "express";
import { getReportsHandler } from "../controllers/report.controller.js";

export const reportsRouter = Router({ mergeParams: true });

reportsRouter.get("/", getReportsHandler);
