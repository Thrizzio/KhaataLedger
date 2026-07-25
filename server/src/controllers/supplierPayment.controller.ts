import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { createSupplierPaymentSchema } from '../validators/supplierPayment.validator.js';

// ── Workspace access guard (OWNER only) ───────────────────────────────────────
async function requireOwnerAccess(workspaceId: string, user: Express.User): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');
    if (workspace.ownerId !== user.id) {
        throw new ApiError(403, 'Only workspace owners can record payments');
    }
}

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
            await tx.supplier.update({
                where: { id: supplierId },
                data: { outstandingBalance: { decrement: amount } },
            });

            return newPayment;
        });

        return res.status(201).json(createSuccessResponse('Supplier payment recorded', payment));
    } catch (error) {
        next(error);
    }
};
