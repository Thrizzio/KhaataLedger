import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import {
    createCustomerSchema,
    updateCustomerSchema,
    customerQuerySchema,
} from '../validators/customer.validator.js';

// ── Workspace access guard ────────────────────────────────────────────────────
async function requireWorkspaceAccess(
    workspaceId: string,
    user: Express.User,
): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');

    if (user.role === 'OWNER' && workspace.ownerId !== user.id) {
        throw new ApiError(403, 'You do not have access to this workspace');
    }
    if (user.role === 'EMPLOYEE' && user.workspaceId !== workspaceId) {
        throw new ApiError(403, 'You do not have access to this workspace');
    }
}

// ── GET /workspaces/:workspaceId/customers ────────────────────────────────────
export const listCustomers: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = customerQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return next(new ApiError(400, 'Invalid query parameters', parsed.error.flatten()));
        }

        const { page, limit, search, sortBy, order } = parsed.data;
        const skip = (page - 1) * limit;

        const baseWhere = { workspaceId, deletedAt: null as null };
        const searchWhere = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { phoneNumber: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const where = { ...baseWhere, ...searchWhere };

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({ where, orderBy: { [sortBy]: order }, skip, take: limit }),
            prisma.customer.count({ where }),
        ]);

        return res.status(200).json(
            createSuccessResponse('Customers fetched', {
                customers,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/customers/:id ────────────────────────────────
export const getCustomer: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const customer = await prisma.customer.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!customer) throw new ApiError(404, 'Customer not found');

        return res.status(200).json(createSuccessResponse('Customer fetched', customer));
    } catch (error) {
        next(error);
    }
};

// ── POST /workspaces/:workspaceId/customers ───────────────────────────────────
export const createCustomer: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = createCustomerSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { name, phoneNumber, email, address } = parsed.data;

        const customer = await prisma.customer.create({
            data: {
                workspaceId,
                name,
                phoneNumber: phoneNumber ?? null,
                email: email ?? null,
                address: address ?? null,
                // outstandingBalance defaults to 0 — never set by clients
            },
        });

        return res.status(201).json(createSuccessResponse('Customer created', customer));
    } catch (error) {
        next(error);
    }
};

// ── PATCH /workspaces/:workspaceId/customers/:id ──────────────────────────────
export const updateCustomer: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const existing = await prisma.customer.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new ApiError(404, 'Customer not found');

        const parsed = updateCustomerSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { name, phoneNumber, email, address } = parsed.data;

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(phoneNumber !== undefined ? { phoneNumber } : {}),
                ...(email !== undefined ? { email } : {}),
                ...(address !== undefined ? { address } : {}),
            },
        });

        return res.status(200).json(createSuccessResponse('Customer updated', customer));
    } catch (error) {
        next(error);
    }
};

// ── DELETE /workspaces/:workspaceId/customers/:id (soft delete) ───────────────
export const deleteCustomer: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const existing = await prisma.customer.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new ApiError(404, 'Customer not found');

        const customer = await prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return res.status(200).json(createSuccessResponse('Customer deleted', customer));
    } catch (error) {
        next(error);
    }
};
