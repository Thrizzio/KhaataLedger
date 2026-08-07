import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { z } from "zod";
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

    // Determine current/previous date ranges for the "period" query param
    const period = req.query.period === 'today' ? 'today' : req.query.period === 'week' ? 'week' : req.query.period === 'month' ? 'month' : 'today';

    const now = new Date();
    const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    let currentStart = todayMidnight;
    let currentEnd = new Date(todayMidnight.getTime() + 86400000);
    let previousStart = new Date(todayMidnight.getTime() - 86400000);
    let previousEnd = todayMidnight;

    if (period === 'week') {
      const day = now.getUTCDay();
      const diff = (day + 6) % 7;
      currentStart = new Date(todayMidnight.getTime() - (diff * 86400000));
      currentEnd = new Date(currentStart.getTime() + (7 * 86400000));
      previousStart = new Date(currentStart.getTime() - (7 * 86400000));
      previousEnd = currentStart;
    } else if (period === 'month') {
      currentStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      currentEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
      previousStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      previousEnd = currentStart;
    }

    // Current Sales Aggregations
    const currentSales = await prisma.sale.findMany({
      where: { workspaceId, saleDate: { gte: currentStart, lt: currentEnd } },
      include: { customer: { select: { name: true } } }
    });

    const previousSales = await prisma.sale.findMany({
      where: { workspaceId, saleDate: { gte: previousStart, lt: previousEnd } }
    });

    let totalRevenue = 0;
    let creditSales = 0;
    let cashSales = 0;
    currentSales.forEach(s => {
      const amt = Number(s.totalAmount);
      totalRevenue += amt;
      if (s.paymentType === 'CREDIT') creditSales += amt;
      if (s.paymentType === 'CASH') cashSales += amt;
    });

    let prevRevenue = 0;
    previousSales.forEach(s => {
      prevRevenue += Number(s.totalAmount);
    });

    const numSales = currentSales.length;
    const avgOrderValue = numSales > 0 ? totalRevenue / numSales : 0;

    let growthValue = 0;
    let growthDirection = "up";
    if (prevRevenue === 0) {
      growthValue = totalRevenue > 0 ? 100 : 0;
      growthDirection = totalRevenue >= 0 ? "up" : "down";
    } else {
      growthValue = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
      if (growthValue < 0) {
        growthDirection = "down";
        growthValue = Math.abs(growthValue);
      }
    }

    // Top Customers
    const customerMap = new Map<string, { name: string, total: number }>();
    currentSales.forEach(s => {
      if (s.customerId && s.customer) {
        const amt = Number(s.totalAmount);
        const existing = customerMap.get(s.customerId) || { name: s.customer.name, total: 0 };
        existing.total += amt;
        customerMap.set(s.customerId, existing);
      }
    });
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(c => ({ name: c.name, amount: `₹${c.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }));

    // Product Aggregations
    const currentLineItems = await prisma.saleLineItem.findMany({
      where: { sale: { workspaceId, saleDate: { gte: currentStart, lt: currentEnd } } }
    });

    const productMap = new Map<string, { name: string, quantity: number }>();
    currentLineItems.forEach(item => {
      const existing = productMap.get(item.inventoryItemId) || { name: item.productName, quantity: 0 };
      existing.quantity += item.quantity;
      productMap.set(item.inventoryItemId, existing);
    });

    const productsArr = Array.from(productMap.values());
    const bestSellingProducts = [...productsArr]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({ product: p.name, quantity: `${p.quantity} sold` }));

    const worstSellingProducts = [...productsArr]
      .filter(p => p.quantity > 0)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 5)
      .map(p => ({ product: p.name, quantity: `${p.quantity} sold` }));

    const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Customer Aggregations
    const activeCustomers = await prisma.customer.findMany({
      where: { workspaceId, deletedAt: null }
    });

    let outstandingCustomerCredit = 0;
    let customersWithOutstandingCredit = 0;
    let newCustomersAdded = 0;

    activeCustomers.forEach(c => {
      const bal = Number(c.outstandingBalance);
      outstandingCustomerCredit += bal;
      if (bal > 0) customersWithOutstandingCredit++;

      const created = new Date(c.createdAt).getTime();
      if (created >= currentStart.getTime() && created < currentEnd.getTime()) {
        newCustomersAdded++;
      }
    });

    const highestOutstandingCustomers = [...activeCustomers]
      .filter(c => Number(c.outstandingBalance) > 0)
      .sort((a, b) => Number(b.outstandingBalance) - Number(a.outstandingBalance))
      .slice(0, 5)
      .map(c => ({ name: c.name, amount: formatCurrency(Number(c.outstandingBalance)) }));

    // Average Customer Spend uses customerMap from active Sales aggregation
    const uniquePurchasingCustomersCount = customerMap.size;
    const averageCustomerSpend = uniquePurchasingCustomersCount > 0
      ? totalRevenue / uniquePurchasingCustomersCount
      : 0;

    // Supplier Aggregations
    const activeSuppliers = await prisma.supplier.findMany({
      where: { workspaceId, deletedAt: null }
    });

    let outstandingSupplierDues = 0;
    let suppliersWithOutstandingDues = 0;
    let newSuppliersAdded = 0;

    activeSuppliers.forEach(s => {
      const bal = Number(s.outstandingBalance);
      outstandingSupplierDues += bal;
      if (bal > 0) suppliersWithOutstandingDues++;

      const created = new Date(s.createdAt).getTime();
      if (created >= currentStart.getTime() && created < currentEnd.getTime()) {
        newSuppliersAdded++;
      }
    });

    const activePurchases = await prisma.purchase.findMany({
      where: {
        workspaceId,
        createdAt: { gte: currentStart, lt: currentEnd }
      },
      include: { supplier: true }
    });

    const supplierPurchaseMap = new Map<string, { name: string, total: number, count: number }>();
    let totalPurchaseValue = 0;

    activePurchases.forEach(p => {
      const amount = Number(p.totalAmount);
      totalPurchaseValue += amount;
      const suppName = p.supplier?.name || 'Unknown Supplier';
      const suppId = p.supplierId || 'unknown';

      if (!supplierPurchaseMap.has(suppId)) {
        supplierPurchaseMap.set(suppId, { name: suppName, total: 0, count: 0 });
      }
      const entry = supplierPurchaseMap.get(suppId)!;
      entry.total += amount;
      entry.count += 1;
    });

    const uniquePurchasingSuppliersCount = supplierPurchaseMap.size;
    const averagePurchaseValuePerSupplier = uniquePurchasingSuppliersCount > 0
      ? totalPurchaseValue / uniquePurchasingSuppliersCount
      : 0;

    const topSuppliersByPurchaseValue = Array.from(supplierPurchaseMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(s => ({ name: s.name, amount: formatCurrency(s.total) }));

    const topSuppliersByPurchaseCount = Array.from(supplierPurchaseMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(s => ({ name: s.name, amount: s.count.toString() }));

    (data as any).period = period;
    (data as any).sections = {
      sales: {
        metrics: [
          { label: "Total Revenue", value: formatCurrency(totalRevenue) },
          { label: "Number of Sales", value: numSales.toString() },
          { label: "Average Order Value", value: formatCurrency(avgOrderValue) },
          { label: "Credit Sales", value: formatCurrency(creditSales) },
          { label: "Cash Sales", value: formatCurrency(cashSales) }
        ],
        growth: {
          value: Number(growthValue.toFixed(1)),
          direction: growthDirection
        },
        bestSellingProducts,
        worstSellingProducts,
        topCustomers
      },
      inventory: { metrics: [] },
      customers: {
        metrics: [
          { label: "Outstanding Customer Credit", value: formatCurrency(outstandingCustomerCredit) },
          { label: "Customers with Outstanding Credit", value: customersWithOutstandingCredit.toString() },
          { label: "New Customers Added", value: newCustomersAdded.toString() },
          { label: "Average Customer Spend", value: formatCurrency(averageCustomerSpend) }
        ],
        topCustomers,
        highestOutstandingCustomers
      },
      suppliers: {
        metrics: [
          { label: "Total Outstanding Supplier Dues", value: formatCurrency(outstandingSupplierDues) },
          { label: "Suppliers with Outstanding Dues", value: suppliersWithOutstandingDues.toString() },
          { label: "New Suppliers Added", value: newSuppliersAdded.toString() },
          { label: "Average Purchase Value per Supplier", value: formatCurrency(averagePurchaseValuePerSupplier) }
        ],
        topSuppliersByPurchaseValue,
        topSuppliersByPurchaseCount
      },
      purchases: { metrics: [] },
      profitability: { metrics: [] },
      cashFlow: { metrics: [] },
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getReports error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate reports" });
  }
};
