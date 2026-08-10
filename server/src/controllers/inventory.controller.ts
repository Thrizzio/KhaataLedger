import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import {
    createInventorySchema,
    updateInventorySchema,
    queryInventorySchema,
} from '../validators/inventory.validator.js';
import { recordAudit } from '../utils/audit.util.js';

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

// ── GET /workspaces/:workspaceId/inventory ────────────────────────────────────
export const listInventory: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = queryInventorySchema.safeParse(req.query);
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
                    { sku: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        const where = { ...baseWhere, ...searchWhere };

        const [items, total] = await Promise.all([
            prisma.inventoryItem.findMany({ where, orderBy: { [sortBy]: order }, skip, take: limit }),
            prisma.inventoryItem.count({ where }),
        ]);

        return res.status(200).json(
            createSuccessResponse('Inventory fetched', {
                items,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/inventory/:id ────────────────────────────────
export const getInventoryItem: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const item = await prisma.inventoryItem.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!item) throw new ApiError(404, 'Inventory item not found');

        return res.status(200).json(createSuccessResponse('Inventory item fetched', item));
    } catch (error) {
        next(error);
    }
};

// ── POST /workspaces/:workspaceId/inventory ───────────────────────────────────
export const createInventoryItem: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const parsed = createInventorySchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { name, sku, unit, defaultSellingPrice } = parsed.data;

        // Enforce SKU uniqueness per workspace
        if (sku) {
            const existing = await prisma.inventoryItem.findFirst({
                where: { workspaceId, sku, deletedAt: null },
            });
            if (existing) throw new ApiError(409, `SKU "${sku}" already exists in this workspace`);
        }

        const item = await prisma.$transaction(async (tx) => {
            const newItem = await tx.inventoryItem.create({
                data: {
                    workspaceId,
                    name,
                    sku: sku ?? null,
                    unit: unit ?? null,
                    defaultSellingPrice,
                },
            });

            await recordAudit(tx, {
                workspaceId,
                action: 'CREATE',
                userId: req.user!.id,
                entityType: 'INVENTORY_ITEM',
                entityId: newItem.id,
                entityTitle: newItem.name,
                previousValue: null,
                newValue: newItem,
            });

            return newItem;
        });

        return res.status(201).json(createSuccessResponse('Inventory item created', item));
    } catch (error) {
        next(error);
    }
};

// ── PATCH /workspaces/:workspaceId/inventory/:id ──────────────────────────────
export const updateInventoryItem: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const existing = await prisma.inventoryItem.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new ApiError(404, 'Inventory item not found');

        const parsed = updateInventorySchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { name, sku, unit, defaultSellingPrice } = parsed.data;

        // If SKU is changing, check for conflicts
        if (sku !== undefined && sku !== null && sku !== existing.sku) {
            const conflict = await prisma.inventoryItem.findFirst({
                where: { workspaceId, sku, deletedAt: null, NOT: { id } },
            });
            if (conflict) throw new ApiError(409, `SKU "${sku}" already exists in this workspace`);
        }

        const item = await prisma.$transaction(async (tx) => {
            const updatedItem = await tx.inventoryItem.update({
                where: { id },
                data: {
                    ...(name !== undefined ? { name } : {}),
                    ...(sku !== undefined ? { sku } : {}),
                    ...(unit !== undefined ? { unit } : {}),
                    ...(defaultSellingPrice !== undefined ? { defaultSellingPrice } : {}),
                },
            });

            await recordAudit(tx, {
                workspaceId,
                action: 'UPDATE',
                userId: req.user!.id,
                entityType: 'INVENTORY_ITEM',
                entityId: updatedItem.id,
                entityTitle: updatedItem.name,
                previousValue: existing,
                newValue: updatedItem,
            });

            return updatedItem;
        });

        return res.status(200).json(createSuccessResponse('Inventory item updated', item));
    } catch (error) {
        next(error);
    }
};

// ── DELETE /workspaces/:workspaceId/inventory/:id (soft delete) ───────────────
export const deleteInventoryItem: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const id = req.params['id'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const existing = await prisma.inventoryItem.findFirst({
            where: { id, workspaceId, deletedAt: null },
        });
        if (!existing) throw new ApiError(404, 'Inventory item not found');

        const item = await prisma.$transaction(async (tx) => {
            const deletedItem = await tx.inventoryItem.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            await recordAudit(tx, {
                workspaceId,
                action: 'DELETE',
                userId: req.user!.id,
                entityType: 'INVENTORY_ITEM',
                entityId: existing.id,
                entityTitle: existing.name,
                previousValue: existing,
                newValue: { ...existing, deletedAt: deletedItem.deletedAt },
            });

            return deletedItem;
        });

        return res.status(200).json(createSuccessResponse('Inventory item deleted', item));
    } catch (error) {
        next(error);
    }
};
