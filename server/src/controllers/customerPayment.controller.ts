import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { createCustomerPaymentSchema, customerPaymentQuerySchema } from '../validators/customerPayment.validator.js';
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

// ── GET /workspaces/:workspaceId/customer-payments ────────────────────────────
export const listCustomerPayments: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = customerPaymentQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return next(new ApiError(400, 'Invalid query parameters', parsed.error.flatten()));
        }

        const { page, limit, search, sortBy, order } = parsed.data;
        const skip = (page - 1) * limit;

        const baseWhere = { workspaceId };
        const searchWhere = search
            ? {
                customer: {
                    name: { contains: search, mode: 'insensitive' as const },
                },
            }
            : {};

        const where = { ...baseWhere, ...searchWhere };

        const [items, total] = await Promise.all([
            prisma.customerPayment.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip,
                take: limit,
                include: {
                    customer: { select: { id: true, name: true } },
                    createdBy: { select: { id: true, name: true } },
                },
            }),
            prisma.customerPayment.count({ where }),
        ]);

        return res.status(200).json(
            createSuccessResponse('Customer payments fetched', {
                items,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            }),
        );
    } catch (error) {
        next(error);
    }
};

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
