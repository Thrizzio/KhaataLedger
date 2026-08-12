import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deduplicate() {
    // Deduplicate Customer phones
    const customerPhones = await prisma.$queryRaw<any[]>`SELECT "workspaceId", "phoneNumber", COUNT(*) as cnt FROM "Customer" WHERE "phoneNumber" IS NOT NULL GROUP BY "workspaceId", "phoneNumber" HAVING COUNT(*) > 1`;

    for (const group of customerPhones) {
        const customers = await prisma.customer.findMany({
            where: { workspaceId: group.workspaceId, phoneNumber: group.phoneNumber },
            orderBy: { createdAt: 'asc' }
        });

        // Skip the first one, rename the rest
        for (let i = 1; i < customers.length; i++) {
            await prisma.customer.update({
                where: { id: customers[i].id },
                data: { phoneNumber: `${customers[i].phoneNumber}-dup${i}` }
            });
            console.log(`Deduplicated customer phone for ${customers[i].id}`);
        }
    }

    // Deduplicate InventoryItem names & skus
    const invNames = await prisma.$queryRaw<any[]>`SELECT "workspaceId", "name", COUNT(*) as cnt FROM "InventoryItem" GROUP BY "workspaceId", "name" HAVING COUNT(*) > 1`;
    for (const group of invNames) {
        const items = await prisma.inventoryItem.findMany({
            where: { workspaceId: group.workspaceId, name: group.name },
            orderBy: { createdAt: 'asc' }
        });
        for (let i = 1; i < items.length; i++) {
            await prisma.inventoryItem.update({
                where: { id: items[i].id },
                data: { name: `${items[i].name}-dup${i}` }
            });
        }
    }

    const invSkus = await prisma.$queryRaw<any[]>`SELECT "workspaceId", "sku", COUNT(*) as cnt FROM "InventoryItem" WHERE "sku" IS NOT NULL GROUP BY "workspaceId", "sku" HAVING COUNT(*) > 1`;
    for (const group of invSkus) {
        const items = await prisma.inventoryItem.findMany({
            where: { workspaceId: group.workspaceId, sku: group.sku },
            orderBy: { createdAt: 'asc' }
        });
        for (let i = 1; i < items.length; i++) {
            await prisma.inventoryItem.update({
                where: { id: items[i].id },
                data: { sku: `${items[i].sku}-dup${i}` }
            });
        }
    }

    // Deduplicate Supplier phones
    const supplierPhones = await prisma.$queryRaw<any[]>`SELECT "workspaceId", "phoneNumber", COUNT(*) as cnt FROM "Supplier" WHERE "phoneNumber" IS NOT NULL GROUP BY "workspaceId", "phoneNumber" HAVING COUNT(*) > 1`;
    for (const group of supplierPhones) {
        const suppliers = await prisma.supplier.findMany({
            where: { workspaceId: group.workspaceId, phoneNumber: group.phoneNumber },
            orderBy: { createdAt: 'asc' }
        });
        for (let i = 1; i < suppliers.length; i++) {
            await prisma.supplier.update({
                where: { id: suppliers[i].id },
                data: { phoneNumber: `${suppliers[i].phoneNumber}-dup${i}` }
            });
        }
    }

    console.log('Deduplication complete.');
}

deduplicate().catch(console.error).finally(() => prisma.$disconnect());
