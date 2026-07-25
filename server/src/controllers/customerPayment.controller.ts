import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { createCustomerPaymentSchema } from '../validators/customerPayment.validator.js';

// ── Workspace access guard (OWNER only) ───────────────────────────────────────
async function requireOwnerAccess(workspaceId: string, user: Express.User): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');
    if (workspace.ownerId !== user.id) {
        throw new ApiError(403, 'Only workspace owners can record payments');
    }
}

// ── POST /workspaces/:workspaceId/customer-payments ───────────────────────────
export const createCustomerPayment: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const user = req.user!;

        await requireOwnerAccess(workspaceId, user);

        // ── Validate request body ────────────────────────────────────────────────
        const parsed = createCustomerPaymentSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { customerId, paymentDate, amount, notes } = parsed.data;

        // ── Pre-transaction checks (read-only) ────────────────────────────────────

        // 1. Verify customer belongs to workspace and is not deleted
        const customer = await prisma.customer.findFirst({
            where: { id: customerId, workspaceId, deletedAt: null },
            select: { id: true, name: true, outstandingBalance: true },
        });
        if (!customer) throw new ApiError(404, 'Customer not found in this workspace');

        // 2. Guard: payment must not exceed outstanding balance
        const balance = Number(customer.outstandingBalance);
        if (amount > balance) {
            throw new ApiError(
                400,
                `Payment amount (${amount}) exceeds customer outstanding balance (${balance})`,
            );
        }

        // ── Atomic transaction ────────────────────────────────────────────────────
        const payment = await prisma.$transaction(async (tx) => {
            // a. Create the immutable payment record
            const newPayment = await tx.customerPayment.create({
                data: {
                    workspaceId,
                    customerId,
                    amount,
                    paymentDate,
                    notes,
                    createdById: user.id,
                },
            });

            // b. Find customer's Khata — only create KhataEntry if ledger exists
            //    We never create a Khata just for a payment (would be an orphan ledger)
            const khata = await tx.khata.findFirst({
                where: { customerId, workspaceId, deletedAt: null },
            });

            if (khata) {
                await tx.khataEntry.create({
                    data: {
                        khataId: khata.id,
                        title: notes ?? `Payment received on ${paymentDate.toISOString().slice(0, 10)}`,
                        amount,
                        type: 'PAYMENT',
                        entryDate: paymentDate,
                        customerPaymentId: newPayment.id,
                        createdById: user.id,
                    },
                });
            }

            // c. Decrement customer's outstanding balance atomically
            await tx.customer.update({
                where: { id: customerId },
                data: { outstandingBalance: { decrement: amount } },
            });

            return newPayment;
        });

        return res.status(201).json(createSuccessResponse('Customer payment recorded', payment));
    } catch (error) {
        next(error);
    }
};
