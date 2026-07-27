import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import {
    createSupplierSchema,
    updateSupplierSchema,
    supplierQuerySchema,
} from '../validators/supplier.validator.js';

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

// ── GET /workspaces/:workspaceId/suppliers ────────────────────────────────────
export const listSuppliers: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = supplierQuerySchema.safeParse(req.query);
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

        const [items, total] = await Promise.all([
            prisma.supplier.findMany({ where, orderBy: { [sortBy]: order }, skip, take: limit }),
            prisma.supplier.count({ where }),
        ]);

        return res.status(200).json(
            createSuccessResponse('Suppliers fetched', {
                items,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/suppliers/:id ────────────────────────────────
export const getSupplier: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const supplier = await prisma.supplier.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!supplier) throw new ApiError(404, 'Supplier not found');

        return res.status(200).json(createSuccessResponse('Supplier fetched', supplier));
    } catch (error) {
        next(error);
    }
};

// ── POST /workspaces/:workspaceId/suppliers ───────────────────────────────────
export const createSupplier: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = createSupplierSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { name, phoneNumber, email, address } = parsed.data;

        const supplier = await prisma.supplier.create({
            data: {
                workspaceId,
                name,
                phoneNumber: phoneNumber ?? null,
                email: email ?? null,
                address: address ?? null,
                // outstandingBalance defaults to 0 — never set by clients
            },
        });

        return res.status(201).json(createSuccessResponse('Supplier created', supplier));
    } catch (error) {
        next(error);
    }
};

// ── PATCH /workspaces/:workspaceId/suppliers/:id ──────────────────────────────
export const updateSupplier: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const existing = await prisma.supplier.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new ApiError(404, 'Supplier not found');

        const parsed = updateSupplierSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { name, phoneNumber, email, address } = parsed.data;

        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                ...(name !== undefined ? { name } : {}),
                ...(phoneNumber !== undefined ? { phoneNumber } : {}),
                ...(email !== undefined ? { email } : {}),
                ...(address !== undefined ? { address } : {}),
            },
        });

        return res.status(200).json(createSuccessResponse('Supplier updated', supplier));
    } catch (error) {
        next(error);
    }
};

// ── DELETE /workspaces/:workspaceId/suppliers/:id (soft delete) ───────────────
export const deleteSupplier: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const existing = await prisma.supplier.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new ApiError(404, 'Supplier not found');

        const supplier = await prisma.supplier.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return res.status(200).json(createSuccessResponse('Supplier deleted', supplier));
    } catch (error) {
        next(error);
    }
};
