import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';

const LOW_STOCK_THRESHOLD = 10;
const ACTIVITY_LIMIT = 20;
const TOP_LIMIT = 10;

// ── Workspace membership check ────────────────────────────────────────────────
async function requireWorkspaceAccess(
    workspaceId: string,
    user: Express.User,
): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');
    const isOwner = workspace.ownerId === user.id;
    const isEmployee = user.workspaceId === workspaceId;
    if (!isOwner && !isEmployee) throw new ApiError(403, 'Access denied');
}

// ── GET /workspaces/:workspaceId/dashboard ────────────────────────────────────
export const getDashboard: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Fan out 9 independent queries in parallel
        const [
            todaySalesAgg,
            todayPurchasesAgg,
            inventoryCount,
            customerCount,
            supplierCount,
            receivablesAgg,
            payablesAgg,
            lowStockCount,
            inventoryForValue,
        ] = await Promise.all([
            // Today's sales total
            prisma.sale.aggregate({
                where: { workspaceId, saleDate: { gte: todayStart, lte: todayEnd } },
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
            // Today's purchases total
            prisma.purchase.aggregate({
                where: { workspaceId, purchaseDate: { gte: todayStart, lte: todayEnd } },
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
            // Active inventory item count
            prisma.inventoryItem.count({ where: { workspaceId, deletedAt: null } }),
            // Active customer count
            prisma.customer.count({ where: { workspaceId, deletedAt: null } }),
            // Active supplier count
            prisma.supplier.count({ where: { workspaceId, deletedAt: null } }),
            // Total customer receivables (sum of outstanding balances)
            prisma.customer.aggregate({
                where: { workspaceId, deletedAt: null },
                _sum: { outstandingBalance: true },
            }),
            // Total supplier payables
            prisma.supplier.aggregate({
                where: { workspaceId, deletedAt: null },
                _sum: { outstandingBalance: true },
            }),
            // Low stock count
            prisma.inventoryItem.count({
                where: { workspaceId, deletedAt: null, currentStock: { lte: LOW_STOCK_THRESHOLD } },
            }),
            // Items for inventory value calculation (stock × lastPurchasePrice)
            prisma.inventoryItem.findMany({
                where: { workspaceId, deletedAt: null, lastPurchasePrice: { not: null } },
                select: { currentStock: true, lastPurchasePrice: true },
            }),
        ]);

        // Inventory value = SUM(currentStock × lastPurchasePrice)
        const inventoryValue = inventoryForValue.reduce(
            (sum, item) => sum + item.currentStock * Number(item.lastPurchasePrice),
            0,
        );

        return res.json(
            createSuccessResponse('Dashboard', {
                today: {
                    salesTotal: Number(todaySalesAgg._sum.totalAmount ?? 0),
                    salesCount: todaySalesAgg._count.id,
                    purchasesTotal: Number(todayPurchasesAgg._sum.totalAmount ?? 0),
                    purchasesCount: todayPurchasesAgg._count.id,
                },
                inventory: {
                    totalItems: inventoryCount,
                    lowStockCount,
                    inventoryValue: Math.round(inventoryValue * 100) / 100,
                    lowStockThreshold: LOW_STOCK_THRESHOLD,
                },
                customers: {
                    total: customerCount,
                    totalReceivables: Number(receivablesAgg._sum.outstandingBalance ?? 0),
                },
                suppliers: {
                    total: supplierCount,
                    totalPayables: Number(payablesAgg._sum.outstandingBalance ?? 0),
                },
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/inventory/low-stock ──────────────────────────
export const getLowStockItems: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const items = await prisma.inventoryItem.findMany({
            where: {
                workspaceId,
                deletedAt: null,
                currentStock: { lte: LOW_STOCK_THRESHOLD },
            },
            select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                currentStock: true,
                lastPurchasePrice: true,
                defaultSellingPrice: true,
            },
            orderBy: { currentStock: 'asc' },
        });

        return res.json(createSuccessResponse('Low stock items', { items, threshold: LOW_STOCK_THRESHOLD }));
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/customers/top-debtors ────────────────────────
export const getTopDebtors: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const customers = await prisma.customer.findMany({
            where: { workspaceId, deletedAt: null, outstandingBalance: { gt: 0 } },
            select: { id: true, name: true, phoneNumber: true, outstandingBalance: true },
            orderBy: { outstandingBalance: 'desc' },
            take: TOP_LIMIT,
        });

        return res.json(createSuccessResponse('Top debtors', { customers }));
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/suppliers/top-payables ───────────────────────
export const getTopPayables: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const suppliers = await prisma.supplier.findMany({
            where: { workspaceId, deletedAt: null, outstandingBalance: { gt: 0 } },
            select: { id: true, name: true, phoneNumber: true, outstandingBalance: true },
            orderBy: { outstandingBalance: 'desc' },
            take: TOP_LIMIT,
        });

        return res.json(createSuccessResponse('Top payables', { suppliers }));
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/activity ─────────────────────────────────────
export const getRecentActivity: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        // Fetch all 4 event types in parallel with generous limits for merge-then-trim
        const [sales, purchases, customerPayments, supplierPayments] = await Promise.all([
            prisma.sale.findMany({
                where: { workspaceId },
                select: {
                    id: true,
                    saleDate: true,
                    totalAmount: true,
                    paymentType: true,
                    customer: { select: { name: true } },
                },
                orderBy: { saleDate: 'desc' },
                take: ACTIVITY_LIMIT,
            }),
            prisma.purchase.findMany({
                where: { workspaceId },
                select: {
                    id: true,
                    purchaseDate: true,
                    totalAmount: true,
                    paymentType: true,
                    supplier: { select: { name: true } },
                },
                orderBy: { purchaseDate: 'desc' },
                take: ACTIVITY_LIMIT,
            }),
            prisma.customerPayment.findMany({
                where: { workspaceId },
                select: {
                    id: true,
                    paymentDate: true,
                    amount: true,
                    notes: true,
                    customer: { select: { name: true } },
                },
                orderBy: { paymentDate: 'desc' },
                take: ACTIVITY_LIMIT,
            }),
            prisma.supplierPayment.findMany({
                where: { workspaceId },
                select: {
                    id: true,
                    paymentDate: true,
                    amount: true,
                    notes: true,
                    supplier: { select: { name: true } },
                },
                orderBy: { paymentDate: 'desc' },
                take: ACTIVITY_LIMIT,
            }),
        ]);

        // Normalise to unified activity shape
        const activity = [
            ...sales.map((s) => ({
                type: 'SALE' as const,
                referenceId: s.id,
                timestamp: s.saleDate,
                title: 'Sale',
                subtitle: s.customer?.name ?? 'Walk-in customer',
                amount: Number(s.totalAmount),
                paymentType: s.paymentType,
            })),
            ...purchases.map((p) => ({
                type: 'PURCHASE' as const,
                referenceId: p.id,
                timestamp: p.purchaseDate,
                title: 'Purchase',
                subtitle: p.supplier?.name ?? 'Unknown supplier',
                amount: Number(p.totalAmount),
                paymentType: p.paymentType,
            })),
            ...customerPayments.map((cp) => ({
                type: 'CUSTOMER_PAYMENT' as const,
                referenceId: cp.id,
                timestamp: cp.paymentDate,
                title: 'Customer Payment',
                subtitle: cp.customer.name,
                amount: Number(cp.amount),
                paymentType: null,
            })),
            ...supplierPayments.map((sp) => ({
                type: 'SUPPLIER_PAYMENT' as const,
                referenceId: sp.id,
                timestamp: sp.paymentDate,
                title: 'Supplier Payment',
                subtitle: sp.supplier.name,
                amount: Number(sp.amount),
                paymentType: null,
            })),
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, ACTIVITY_LIMIT);

        return res.json(createSuccessResponse('Recent activity', { activity, total: activity.length }));
    } catch (error) {
        next(error);
    }
};
