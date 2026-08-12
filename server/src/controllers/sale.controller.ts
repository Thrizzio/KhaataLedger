import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/api-error.js';
import { createSuccessResponse } from '../utils/api-response.js';
import { createSaleSchema, updateSaleSchema } from '../validators/sale.validator.js';
import { recordAudit } from '../utils/audit.util.js';

// ── Workspace access guard (OWNER only) ───────────────────────────────────────
async function requireOwnerAccess(
    workspaceId: string,
    user: Express.User,
): Promise<void> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new ApiError(404, 'Workspace not found');
    if (workspace.ownerId !== user.id) {
        throw new ApiError(403, 'Only workspace owners can create sales');
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

// ── GET /workspaces/:workspaceId/sales ───────────────────────────────────────
export const listSales: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        await requireWorkspaceAccess(workspaceId, req.user!);

        const { saleQuerySchema } = await import('../validators/sale.validator.js');
        const parsed = saleQuerySchema.safeParse(req.query);
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
            prisma.sale.findMany({
                where,
                orderBy: { [sortBy]: order },
                skip,
                take: limit,
                include: { lineItems: true, customer: { select: { id: true, name: true } } },
            }),
            prisma.sale.count({ where }),
        ]);

        return res.status(200).json(
            createSuccessResponse('Sales fetched', {
                items,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            }),
        );
    } catch (error) {
        next(error);
    }
};

// ── POST /workspaces/:workspaceId/sales ───────────────────────────────────────
export const createSale: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const user = req.user!;

        await requireOwnerAccess(workspaceId, user);

        // ── Validate request body ────────────────────────────────────────────────
        const parsed = createSaleSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { customerId, saleDate, paymentType, items } = parsed.data;

        // ── Pre-transaction checks (read-only) ────────────────────────────────────

        // 1. Verify customer belongs to workspace (CREDIT sales always have customerId)
        let customer: { id: string; name: string; phoneNumber: string | null } | null = null;
        if (customerId) {
            customer = await prisma.customer.findFirst({
                where: { id: customerId, workspaceId, deletedAt: null },
                select: { id: true, name: true, phoneNumber: true },
            });
            if (!customer) throw new ApiError(404, 'Customer not found in this workspace');
        }

        // 2. Verify every inventory item belongs to workspace
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
                `Inventory items not found in this workspace: ${missing.join(', ')}`,
            );
        }

        // 3. Check stock sufficiency for every item BEFORE opening transaction
        const itemLookup = new Map(inventoryItems.map((i) => [i.id, i]));
        for (const item of items) {
            const inv = itemLookup.get(item.inventoryItemId)!;
            if (inv.currentStock < item.quantity) {
                throw new ApiError(
                    400,
                    `Insufficient stock for "${inv.name}": available ${inv.currentStock}, requested ${item.quantity}`,
                );
            }
        }

        // ── Calculate totalAmount server-side — never from client ─────────────────
        const totalAmount = items.reduce(
            (sum, item) => sum + item.quantity * item.sellingPrice,
            0,
        );

        // ── Atomic transaction ────────────────────────────────────────────────────
        const sale = await prisma.$transaction(async (tx) => {
            // a. Create the Sale header
            const newSale = await tx.sale.create({
                data: {
                    workspaceId,
                    customerId: customerId ?? null,
                    createdById: user.id,
                    saleDate,
                    totalAmount,
                    paymentType,
                },
            });

            // b. Create all SaleLineItems with productName snapshot
            await tx.saleLineItem.createMany({
                data: items.map((item) => ({
                    saleId: newSale.id,
                    inventoryItemId: item.inventoryItemId,
                    quantity: item.quantity,
                    sellingPrice: item.sellingPrice,
                    productName: itemLookup.get(item.inventoryItemId)!.name,
                })),
            });

            // c. Decrease stock for each item atomically.
            await Promise.all(
                items.map((item) =>
                    tx.inventoryItem.update({
                        where: { id: item.inventoryItemId },
                        data: { currentStock: { decrement: item.quantity } },
                    }),
                ),
            );

            // d. CREDIT-only: Khata ledger + customer balance
            if (paymentType === 'CREDIT' && customer) {
                // d1. Find the customer's existing Khata (search by customerId — not name)
                let khata = await tx.khata.findFirst({
                    where: { customerId: customer.id, workspaceId, deletedAt: null },
                });

                // d2. No Khata yet — create one for this customer
                if (!khata) {
                    khata = await tx.khata.create({
                        data: {
                            workspaceId,
                            customerId: customer.id,
                            // Legacy required fields populated from Customer record
                            customerName: customer.name,
                            contactNumber: customer.phoneNumber ?? '',
                            title: customer.name,
                            initialAmount: 0,
                            createdById: user.id,
                        },
                    });
                }

                // d3. Create a CREDIT KhataEntry linked to this sale
                await tx.khataEntry.create({
                    data: {
                        khataId: khata.id,
                        title: `Sale on ${saleDate.toISOString().slice(0, 10)}`,
                        amount: totalAmount,
                        type: 'CREDIT',
                        entryDate: saleDate,
                        saleId: newSale.id,
                        createdById: user.id,
                    },
                });

                // d4. Increase customer's outstanding balance.
                await tx.customer.update({
                    where: { id: customer.id },
                    data: { outstandingBalance: { increment: totalAmount } },
                });
            }

            // e. Record Audit.
            await recordAudit(tx, {
                workspaceId,
                action: 'CREATE',
                userId: user.id,
                entityType: 'SALE',
                entityId: newSale.id,
                entityTitle: `Sale to ${customer?.name || 'Walk-in'}`,
                previousValue: null,
                newValue: newSale,
            });

            return newSale;
        });

        // Fetch full result with line items for response
        const result = await prisma.sale.findUnique({
            where: { id: sale.id },
            include: {
                lineItems: true,
                customer: { select: { id: true, name: true } },
            },
        });

        return res.status(201).json(createSuccessResponse('Sale created', result));
    } catch (error) {
        next(error);
    }
};

// ── PUT /workspaces/:workspaceId/sales/:id ────────────────────────────────────
export const updateSale: RequestHandler = async (req, res, next) => {
    try {
        const workspaceId = req.params['workspaceId'] as string;
        const saleId = req.params['id'] as string;
        const user = req.user!;

        await requireOwnerAccess(workspaceId, user);

        const parsed = updateSaleSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new ApiError(400, 'Validation failed', parsed.error.flatten()));
        }

        const { saleDate, items } = parsed.data;

        // Fetch existing sale
        const existingSale = await prisma.sale.findUnique({
            where: { id: saleId, workspaceId },
            include: { lineItems: true, customer: true, khataEntries: true }
        });

        if (!existingSale) {
            throw new ApiError(404, 'Sale not found');
        }

        // 2. Verify every inventory item belongs to workspace
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
                `Inventory items not found in this workspace: ${missing.join(', ')}`,
            );
        }

        // Calculate total amount
        const totalAmount = items.reduce(
            (sum, item) => sum + item.quantity * item.sellingPrice,
            0,
        );

        // Pre-check stock: currentStock + oldQuantity - newQuantity >= 0
        const itemLookup = new Map(inventoryItems.map((i) => [i.id, i]));
        const oldItemsMap = new Map(existingSale.lineItems.map(i => [i.inventoryItemId, i.quantity]));

        for (const item of items) {
            const inv = itemLookup.get(item.inventoryItemId)!;
            const oldQty = oldItemsMap.get(item.inventoryItemId) || 0;
            const available = inv.currentStock + oldQty;
            
            if (available < item.quantity) {
                throw new ApiError(
                    400,
                    `Insufficient stock for "${inv.name}": available ${available}, requested ${item.quantity}`,
                );
            }
        }

        const updatedSale = await prisma.$transaction(async (tx) => {
            // Revert old inventory stock
            await Promise.all(
                existingSale.lineItems.map(oldItem => 
                    tx.inventoryItem.update({
                        where: { id: oldItem.inventoryItemId },
                        data: { currentStock: { increment: oldItem.quantity } }
                    })
                )
            );

            // Apply new inventory stock
            await Promise.all(
                items.map(newItem => 
                    tx.inventoryItem.update({
                        where: { id: newItem.inventoryItemId },
                        data: { currentStock: { decrement: newItem.quantity } }
                    })
                )
            );

            // Revert old customer / khata entry if CREDIT
            if (existingSale.paymentType === 'CREDIT' && existingSale.customerId) {
                // decrease outstanding balance
                await tx.customer.update({
                    where: { id: existingSale.customerId },
                    data: { outstandingBalance: { decrement: existingSale.totalAmount } }
                });

                // Update KhataEntry
                const khataEntry = existingSale.khataEntries[0];
                if (khataEntry) {
                    await tx.khataEntry.update({
                        where: { id: khataEntry.id },
                        data: { amount: totalAmount, entryDate: saleDate }
                    });
                }

                // Apply new outstanding balance
                await tx.customer.update({
                    where: { id: existingSale.customerId },
                    data: { outstandingBalance: { increment: totalAmount } }
                });
            }

            // Update Sale
            const sale = await tx.sale.update({
                where: { id: saleId },
                data: {
                    saleDate,
                    totalAmount
                }
            });

            // Delete old line items
            await tx.saleLineItem.deleteMany({
                where: { saleId }
            });

            // Create new line items
            await tx.saleLineItem.createMany({
                data: items.map((item) => ({
                    saleId: sale.id,
                    inventoryItemId: item.inventoryItemId,
                    quantity: item.quantity,
                    sellingPrice: item.sellingPrice,
                    productName: itemLookup.get(item.inventoryItemId)!.name,
                })),
            });

            const afterUpdate = await tx.sale.findUnique({
                where: { id: saleId },
                include: { lineItems: true }
            });

            await recordAudit(tx, {
                workspaceId,
                action: 'UPDATE',
                userId: user.id,
                entityType: 'SALE',
                entityId: saleId,
                entityTitle: `Sale to ${existingSale.customer?.name || 'Cash Customer'}`,
                previousValue: {
                    saleDate: existingSale.saleDate,
                    totalAmount: existingSale.totalAmount,
                    items: existingSale.lineItems
                },
                newValue: {
                    saleDate: saleDate,
                    totalAmount,
                    items: afterUpdate?.lineItems
                }
            });

            return afterUpdate;
        });

        // Fetch full result
        const result = await prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                lineItems: true,
                customer: { select: { id: true, name: true } },
            },
        });

        return res.status(200).json(createSuccessResponse('Sale updated', result));
    } catch (error) {
        next(error);
    }
};
