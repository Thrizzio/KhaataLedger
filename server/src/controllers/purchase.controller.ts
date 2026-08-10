import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { createPurchaseSchema } from '../validators/purchase.validator.js';
import { recordAudit } from '../utils/audit.util.js';

// ── Workspace access guard (OWNER only) ───────────────────────────────────────
async function requireOwnerAccess(
    workspaceId: string,
    user: Express.User,
): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');
    if (workspace.ownerId !== user.id) {
        throw new ApiError(403, 'Only workspace owners can create purchases');
    }
}

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

// ── GET /workspaces/:workspaceId/purchases ────────────────────────────────────
export const listPurchases: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const { purchaseQuerySchema } = await import('../validators/purchase.validator.js');
        const parsed = purchaseQuerySchema.safeParse(req.query);
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
            prisma.purchase.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip,
                take: limit,
                include: { lineItems: true, supplier: { select: { id: true, name: true } } },
            }),
            prisma.purchase.count({ where }),
        ]);

        return res.status(200).json(
            createSuccessResponse('Purchases fetched', {
                items,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── POST /workspaces/:workspaceId/purchases ───────────────────────────────────
export const createPurchase: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const user = req.user!;

        await requireOwnerAccess(workspaceId, user);

        // ── Validate request body ────────────────────────────────────────────────
        const parsed = createPurchaseSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { supplierId, purchaseDate, paymentType, items } = parsed.data;

        // ── Pre-transaction checks (read-only — safe outside tx) ─────────────────

        // 1. Verify supplier belongs to this workspace
        const supplier = await prisma.supplier.findFirst({
            where: { id: supplierId, workspaceId, deletedAt: null },
        });
        if (!supplier) {
            throw new ApiError(404, 'Supplier not found in this workspace');
        }

        // 2. Verify every inventory item belongs to this workspace
        const itemIds = items.map((i) => i.inventoryItemId);
        const inventoryItems = await prisma.inventoryItem.findMany({
            where: { id: { in: itemIds }, workspaceId, deletedAt: null },
            select: { id: true, name: true, currentStock: true },
        });

        if (inventoryItems.length !== itemIds.length) {
            const foundIds = new Set(inventoryItems.map((i) => i.id));
            const missing = itemIds.filter((id) => !foundIds.has(id));
            throw new ApiError(
                404,
                `The following inventory items were not found in this workspace: ${missing.join(', ')}`,
            );
        }

        // Build a lookup for item names (for snapshot)
        const itemLookup = new Map(inventoryItems.map((i) => [i.id, i]));

        // ── Calculate totalAmount server-side — never from client ─────────────────
        const totalAmount = items.reduce(
            (sum, item) => sum + item.quantity * item.purchasePrice,
            0,
        );

        // ── Atomic transaction ────────────────────────────────────────────────────
        const purchase = await prisma.$transaction(async (tx) => {
            // a. Create the Purchase header
            const newPurchase = await tx.purchase.create({
                data: {
                    workspaceId,
                    supplierId,
                    createdById: user.id,
                    purchaseDate,
                    totalAmount,
                    paymentType,
                },
            });

            // b. Create all PurchaseLineItems with productName snapshot
            await tx.purchaseLineItem.createMany({
                data: items.map((item) => ({
                    purchaseId: newPurchase.id,
                    inventoryItemId: item.inventoryItemId,
                    quantity: item.quantity,
                    purchasePrice: item.purchasePrice,
                    productName: itemLookup.get(item.inventoryItemId)!.name,
                })),
            });

            // c. Update stock and lastPurchasePrice for each item
            await Promise.all(
                items.map((item) =>
                    tx.inventoryItem.update({
                        where: { id: item.inventoryItemId },
                        data: {
                            currentStock: { increment: item.quantity },
                            lastPurchasePrice: item.purchasePrice,
                        },
                    }),
                ),
            );

            // d. Credit purchase → supplier is now owed totalAmount
            if (paymentType === 'CREDIT') {
                await tx.supplier.update({
                    where: { id: supplierId },
                    data: { outstandingBalance: { increment: totalAmount } },
                });
            }

            // e. Record audit log
            await recordAudit(tx, {
                workspaceId,
                action: 'CREATE',
                userId: user.id,
                entityType: 'PURCHASE',
                entityId: newPurchase.id,
                entityTitle: `Purchase from ${supplier.name}`,
                previousValue: null,
                newValue: newPurchase,
            });

            return newPurchase;

        });

        // Fetch with line items for response
        const result = await prisma.purchase.findUnique({
            where: { id: purchase.id },
            include: { lineItems: true, supplier: { select: { id: true, name: true } } },
        });

        return res.status(201).json(createSuccessResponse('Purchase created', result));
    } catch (error) {
        next(error);
    }
};

// ── GET /workspaces/:workspaceId/purchases/:id ────────────────────────────────
export const getPurchase: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const purchaseId = req.params['id'] as string;

        await requireWorkspaceAccess(workspaceId, req.user!);

        const purchase = await prisma.purchase.findFirst({
            where: { id: purchaseId, workspaceId },
            include: { lineItems: true, supplier: { select: { id: true, name: true } } },
        });

        if (!purchase) {
            throw new ApiError(404, 'Purchase not found');
        }

        return res.status(200).json(createSuccessResponse('Purchase retrieved', purchase));
    } catch (error) {
        next(error);
    }
};
