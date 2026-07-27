import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';

// ── Workspace membership check (owner or employee) ────────────────────────────
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

// ── GET /workspaces/:workspaceId/customers/:customerId/ledger ─────────────────
export const getCustomerLedger: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const customerId = req.params['customerId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const customer = await prisma.customer.findFirst({
            where: { id: customerId, workspaceId, deletedAt: null },
            select: { id: true, name: true, phoneNumber: true, email: true, outstandingBalance: true },
        });
        if (!customer) throw new ApiError(404, 'Customer not found in this workspace');

        // Find the customer's Khata (may not exist if no credit sales yet)
        const khata = await prisma.khata.findFirst({
            where: { customerId, workspaceId, deletedAt: null },
            include: {
                entries: {
                    where: { deletedAt: null },
                    orderBy: { entryDate: 'asc' },
                    select: {
                        id: true,
                        type: true,
                        amount: true,
                        title: true,
                        entryDate: true,
                        saleId: true,
                        customerPaymentId: true,
                        createdAt: true,
                    },
                },
            },
        });

        return res.json(
            createSuccessResponse('Customer ledger', {
                customer,
                ledger: khata?.entries ?? [],
                totalEntries: khata?.entries.length ?? 0,
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/suppliers/:supplierId/ledger ─────────────────
export const getSupplierLedger: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const supplierId = req.params['supplierId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const supplier = await prisma.supplier.findFirst({
            where: { id: supplierId, workspaceId, deletedAt: null },
            select: { id: true, name: true, phoneNumber: true, email: true, outstandingBalance: true },
        });
        if (!supplier) throw new ApiError(404, 'Supplier not found in this workspace');

        // Fetch purchases and payments in parallel
        const [purchases, payments] = await Promise.all([
            prisma.purchase.findMany({
                where: { supplierId, workspaceId },
                select: {
                    id: true,
                    purchaseDate: true,
                    totalAmount: true,
                    paymentType: true,
                    createdAt: true,
                    lineItems: { select: { productName: true, quantity: true, purchasePrice: true } },
                },
                orderBy: { purchaseDate: 'asc' },
            }),
            prisma.supplierPayment.findMany({
                where: { supplierId, workspaceId },
                select: { id: true, paymentDate: true, amount: true, notes: true, createdAt: true },
                orderBy: { paymentDate: 'asc' },
            }),
        ]);

        // Merge and sort by date (ascending)
        const ledger = [
            ...purchases.map((p) => ({
                type: 'PURCHASE' as const,
                referenceId: p.id,
                date: p.purchaseDate,
                amount: p.totalAmount,
                paymentType: p.paymentType,
                title: `Purchase — ${p.lineItems.map((l) => l.productName).join(', ')}`,
                lineItems: p.lineItems,
            })),
            ...payments.map((p) => ({
                type: 'PAYMENT' as const,
                referenceId: p.id,
                date: p.paymentDate,
                amount: p.amount,
                paymentType: null,
                title: p.notes ?? 'Payment to supplier',
                lineItems: [],
            })),
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return res.json(
            createSuccessResponse('Supplier ledger', {
                supplier,
                ledger,
                totalEntries: ledger.length,
            }),
        );
    } catch (error) {
        next(error);
    }
};
