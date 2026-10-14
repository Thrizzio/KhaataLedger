import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { createSupplierPaymentSchema, supplierPaymentQuerySchema } from '../validators/supplierPayment.validator.js';

// ── Workspace access guard (OWNER only) ───────────────────────────────────────
async function requireOwnerAccess(workspaceId: string, user: Express.User): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');
    if (workspace.ownerId !== user.id) {
        throw new ApiError(403, 'Only workspace owners can record payments');
    }
}

async function requireWorkspaceAccess(workspaceId: string, user: Express.User): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');

    if (user.role === 'OWNER' && workspace.ownerId !== user.id) {
        throw new ApiError(403, 'You do not have access to this workspace');
    }
    if (user.role === 'EMPLOYEE' && user.workspaceId !== workspaceId) {
        throw new ApiError(403, 'You do not have access to this workspace');
    }
}

// ── GET /workspaces/:workspaceId/supplier-payments ────────────────────────────
export const listSupplierPayments: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = supplierPaymentQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return next(new ApiError(400, 'Invalid query parameters', parsed.error.flatten()));
        }

        const { page, limit, search, sortBy, order } = parsed.data;
        const skip = (page - 1) * limit;

        const baseWhere = { workspaceId };
        const searchWhere = search
            ? {
                supplier: {
                    name: { contains: search, mode: 'insensitive' as const },
                },
            }
            : {};

        const where = { ...baseWhere, ...searchWhere };

        const [items, total] = await Promise.all([
            prisma.supplierPayment.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip,
                take: limit,
                include: {
                    supplier: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true } },
                },
            }),
            prisma.supplierPayment.count({ where }),
        ]);

        return res.status(200).json(
            createSuccessResponse('Supplier payments fetched', {
                items,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── POST /workspaces/:workspaceId/supplier-payments ───────────────────────────
export const createSupplierPayment: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const user = req.user!;

        await requireOwnerAccess(workspaceId, user);

        // ── Validate request body ────────────────────────────────────────────────
        const parsed = createSupplierPaymentSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { supplierId, paymentDate, amount, notes } = parsed.data;

        // ── Pre-transaction checks (read-only) ────────────────────────────────────

        // 1. Verify supplier belongs to workspace and is not deleted
        const supplier = await prisma.supplier.findFirst({
            where: { id: supplierId, workspaceId, deletedAt: null },
            select: { id: true, name: true, outstandingBalance: true },
        });
        if (!supplier) throw new ApiError(404, 'Supplier not found in this workspace');

        // 2. Guard: payment must not exceed outstanding balance (what we owe them)
        const balance = Number(supplier.outstandingBalance);
        if (amount > balance) {
            throw new ApiError(
                400,
                `Payment amount (${amount}) exceeds supplier outstanding balance (${balance})`,
            );
        }

        // ── Atomic transaction ────────────────────────────────────────────────────
        const payment = await prisma.$transaction(async (tx) => {
            // a. Create the immutable payment record
            const newPayment = await tx.supplierPayment.create({
                data: {
                    workspaceId,
                    supplierId,
                    amount,
                    paymentDate,
                    notes,
                    createdById: user.id,
                },
            });

            // b. Decrement supplier's outstanding balance atomically
            const updatedCount = await tx.supplier.updateMany({
                where: {
                    id: supplierId,
                    workspaceId,
                    deletedAt: null,
                    outstandingBalance: { gte: amount },
                },
                data: { outstandingBalance: { decrement: amount } },
            });
            if (updatedCount.count !== 1) {
                throw new ApiError(409, 'Supplier balance changed while recording the payment; please retry.');
            }

            return newPayment;
        });

        return res.status(201).json(createSuccessResponse('Supplier payment recorded', payment));
    } catch (error) {
        next(error);
    }
};
