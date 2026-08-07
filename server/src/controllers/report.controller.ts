import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { z } from "zod";
import { getReports, REPORT_RANGES, type ReportRange } from "../services/report.service.js";
import { generateBusinessSummary } from "../services/aiSummary.service.js";

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
      include: {
        customer: { select: { name: true } },
        lineItems: { include: { inventoryItem: { select: { name: true } } } }
      }
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
      include: { supplier: true, lineItems: true }
    });

    const supplierPurchaseMap = new Map<string, { name: string, total: number, count: number }>();
    let totalPurchaseValue = 0;
    let totalItemsPurchased = 0;
    const purchasedProductsMap = new Map<string, number>();

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

      (p as any).lineItems?.forEach((li: any) => {
        const qty = Number(li.quantity);
        totalItemsPurchased += qty;

        const pName = li.productName || 'Unknown Product';
        purchasedProductsMap.set(pName, (purchasedProductsMap.get(pName) || 0) + qty);
      });
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

    const numPurchases = activePurchases.length;
    const avgPurchaseValue = numPurchases > 0 ? totalPurchaseValue / numPurchases : 0;
    const avgItemsPerPurchase = numPurchases > 0 ? totalItemsPurchased / numPurchases : 0;

    let highestPurchaseValue = 0;
    let lowestPurchaseValue = 0;
    if (numPurchases > 0) {
      const amounts = activePurchases.map(p => Number(p.totalAmount));
      highestPurchaseValue = Math.max(...amounts);
      lowestPurchaseValue = Math.min(...amounts);
    }

    const mostPurchasedProducts = Array.from(purchasedProductsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([product, quantity]) => ({ product, quantity: quantity.toString() }));

    const largestPurchases = [...activePurchases]
      .sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount))
      .slice(0, 5)
      .map(p => ({
        supplier: p.supplier?.name || 'Unknown Supplier',
        date: new Date(p.createdAt).toLocaleDateString(),
        amount: formatCurrency(Number(p.totalAmount))
      }));

    // Cash Flow Aggregations
    let totalCashSales = 0;
    let totalCreditSales = 0;

    currentSales.forEach(s => {
      if (s.paymentType === 'CASH') {
        totalCashSales += Number(s.totalAmount);
      } else {
        totalCreditSales += Number(s.totalAmount);
      }
    });

    let totalCashPurchases = 0;
    activePurchases.forEach(p => {
      if (p.paymentType === 'CASH') {
        totalCashPurchases += Number(p.totalAmount);
      }
    });

    const activeCustomerPayments = await prisma.customerPayment.findMany({
      where: { workspaceId, createdAt: { gte: currentStart, lt: currentEnd } },
      include: { customer: true }
    });

    const activeSupplierPayments = await prisma.supplierPayment.findMany({
      where: { workspaceId, createdAt: { gte: currentStart, lt: currentEnd } },
      include: { supplier: true }
    });

    let totalCustomerCollections = 0;
    activeCustomerPayments.forEach(p => totalCustomerCollections += Number(p.amount));

    let totalSupplierPayments = 0;
    activeSupplierPayments.forEach(p => totalSupplierPayments += Number(p.amount));

    const cashInflow = totalCashSales + totalCustomerCollections;
    const cashOutflow = totalCashPurchases + totalSupplierPayments;
    const netCashFlow = cashInflow - cashOutflow;

    let netCashFlowStatus = 'Neutral';
    if (netCashFlow > 0) netCashFlowStatus = 'Positive';
    else if (netCashFlow < 0) netCashFlowStatus = 'Negative';

    const incomingTransactions = [
      ...currentSales.filter(s => s.paymentType === 'CASH').map(s => ({
        date: new Date(s.createdAt).toLocaleDateString(),
        source: s.customer?.name ? `Sale: ${s.customer.name}` : 'Cash Sale',
        amountVal: Number(s.totalAmount),
        amount: formatCurrency(Number(s.totalAmount))
      })),
      ...activeCustomerPayments.map(p => ({
        date: new Date(p.createdAt).toLocaleDateString(),
        source: `Collection: ${p.customer?.name || 'Unknown'}`,
        amountVal: Number(p.amount),
        amount: formatCurrency(Number(p.amount))
      }))
    ];

    const largestInflows = incomingTransactions
      .sort((a, b) => b.amountVal - a.amountVal)
      .slice(0, 5)
      .map(({ date, source, amount }) => ({ date, source, amount }));

    const outgoingTransactions = [
      ...activePurchases.filter(p => p.paymentType === 'CASH').map(p => ({
        date: new Date(p.createdAt).toLocaleDateString(),
        supplier: p.supplier?.name || 'Cash Purchase',
        amountVal: Number(p.totalAmount),
        amount: formatCurrency(Number(p.totalAmount))
      })),
      ...activeSupplierPayments.map(p => ({
        date: new Date(p.createdAt).toLocaleDateString(),
        supplier: `Payment: ${p.supplier?.name || 'Unknown'}`,
        amountVal: Number(p.amount),
        amount: formatCurrency(Number(p.amount))
      }))
    ];

    const largestOutflows = outgoingTransactions
      .sort((a, b) => b.amountVal - a.amountVal)
      .slice(0, 5)
      .map(({ date, supplier, amount }) => ({ date, supplier, amount }));

    // Profitability Aggregations
    const estimatedGrossProfit = totalRevenue - totalPurchaseValue;
    const grossProfitMargin = totalRevenue > 0 ? (estimatedGrossProfit / totalRevenue) * 100 : 0;

    let profitabilityStatus = 'Low';
    let profitStatusMap = 'Negative'; // Re-use status color map for Metric UI
    if (grossProfitMargin > 30) {
      profitabilityStatus = 'Excellent';
      profitStatusMap = 'Positive';
    } else if (grossProfitMargin > 15) {
      profitabilityStatus = 'Healthy';
      profitStatusMap = 'Positive';
    } else if (grossProfitMargin > 5) {
      profitabilityStatus = 'Average';
      profitStatusMap = 'Neutral';
    }

    const productRevenueMap = new Map<string, number>();
    currentSales.forEach(s => {
      s.lineItems.forEach(li => {
        const pn = li.productName || li.inventoryItem?.name || 'Unknown Product';
        const current = productRevenueMap.get(pn) || 0;
        productRevenueMap.set(pn, current + (li.quantity * Number(li.sellingPrice)));
      });
    });

    const highestRevenueProducts = Array.from(productRevenueMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({
        product: name,
        revenue: formatCurrency(revenue)
      }));

    // Reuse customerMap calculated during Sales/Customers
    const topRevenueCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(c => ({ name: c.name, amount: formatCurrency(c.total) }));

    // Inventory Aggregations
    const activeInventory = await prisma.inventoryItem.findMany({
      where: { workspaceId, deletedAt: null }
    });

    let totalInventoryValue = 0;
    let lowStockItemsCount = 0;
    let outOfStockItemsCount = 0;
    const hardcodedReorderLevel = 5;

    activeInventory.forEach(item => {
      const stock = item.currentStock;
      totalInventoryValue += stock * Number(item.defaultSellingPrice);
      if (stock === 0) outOfStockItemsCount++;
      else if (stock <= hardcodedReorderLevel) lowStockItemsCount++;
    });

    const totalProductsCount = activeInventory.length;
    const averageStockPerProduct = totalProductsCount > 0
      ? (activeInventory.reduce((acc, curr) => acc + curr.currentStock, 0) / totalProductsCount)
      : 0;

    const lowStockProductsMap = [...activeInventory]
      .filter(item => item.currentStock <= hardcodedReorderLevel && item.currentStock > 0)
      .sort((a, b) => a.currentStock - b.currentStock)
      .slice(0, 5)
      .map(item => ({
        product: item.name,
        stock: item.currentStock.toString(),
        reorderLevel: hardcodedReorderLevel.toString()
      }));

    const outOfStockProductsMap = [...activeInventory]
      .filter(item => item.currentStock === 0)
      .map(item => ({ product: item.name }));

    const highestStockProductsMap = [...activeInventory]
      .sort((a, b) => b.currentStock - a.currentStock)
      .slice(0, 5)
      .map(item => ({ product: item.name, stock: item.currentStock.toString() }));

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
      inventory: {
        metrics: [
          { label: "Total Inventory Value", value: formatCurrency(totalInventoryValue) },
          { label: "Total Products", value: totalProductsCount.toString() },
          { label: "Low Stock Items", value: lowStockItemsCount.toString() },
          { label: "Out of Stock Items", value: outOfStockItemsCount.toString() },
          { label: "Average Stock Per Product", value: Math.floor(averageStockPerProduct).toString() }
        ],
        lowStockProducts: lowStockProductsMap,
        outOfStockProducts: outOfStockProductsMap,
        highestStockProducts: highestStockProductsMap
      },
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
      purchases: {
        metrics: [
          { label: "Total Purchase Value", value: formatCurrency(totalPurchaseValue) },
          { label: "Number of Purchases", value: numPurchases.toString() },
          { label: "Average Purchase Value", value: formatCurrency(avgPurchaseValue) },
          { label: "Average Items Per Purchase", value: avgItemsPerPurchase.toFixed(1) },
          { label: "Highest Purchase Value", value: formatCurrency(highestPurchaseValue) },
          { label: "Lowest Purchase Value", value: formatCurrency(lowestPurchaseValue) }
        ],
        mostPurchasedProducts,
        largestPurchases
      },
      profitability: {
        metrics: [
          { label: "Total Revenue", value: formatCurrency(totalRevenue) },
          { label: "Total Purchase Cost", value: formatCurrency(totalPurchaseValue) },
          { label: "Estimated Gross Profit", value: formatCurrency(estimatedGrossProfit), status: profitStatusMap },
          { label: "Gross Profit Margin", value: `${grossProfitMargin.toFixed(1)}%`, status: profitStatusMap },
          { label: "Profitability Status", value: profitabilityStatus, status: profitStatusMap }
        ],
        highestRevenueProducts,
        topCustomers: topRevenueCustomers
      },
      cashFlow: {
        metrics: [
          { label: "Cash Inflow", value: formatCurrency(cashInflow) },
          { label: "Cash Outflow", value: formatCurrency(cashOutflow) },
          { label: "Net Cash Flow", value: formatCurrency(netCashFlow), status: netCashFlowStatus }
        ],
        paymentBreakdown: [
          { source: "Cash Sales", amount: formatCurrency(totalCashSales) },
          { source: "Credit Sales", amount: formatCurrency(totalCreditSales) },
          { source: "Customer Collections", amount: formatCurrency(totalCustomerCollections) },
          { source: "Supplier Payments", amount: formatCurrency(totalSupplierPayments) }
        ],
        largestInflows,
        largestOutflows
      },
    };

    const aiSummary = await generateBusinessSummary(data);
    (data as any).aiSummary = aiSummary;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getReports error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate reports" });
  }
};
