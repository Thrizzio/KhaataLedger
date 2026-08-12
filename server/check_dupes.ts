import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const customerNames = await prisma.$queryRaw`SELECT "workspaceId", "name", COUNT(*) as cnt FROM "Customer" GROUP BY "workspaceId", "name" HAVING COUNT(*) > 1`;
    const supplierNames = await prisma.$queryRaw`SELECT "workspaceId", "name", COUNT(*) as cnt FROM "Supplier" GROUP BY "workspaceId", "name" HAVING COUNT(*) > 1`;
    const inventoryNames = await prisma.$queryRaw`SELECT "workspaceId", "name", COUNT(*) as cnt FROM "InventoryItem" GROUP BY "workspaceId", "name" HAVING COUNT(*) > 1`;

    const customerPhones = await prisma.$queryRaw`SELECT "workspaceId", "phoneNumber", COUNT(*) as cnt FROM "Customer" WHERE "phoneNumber" IS NOT NULL GROUP BY "workspaceId", "phoneNumber" HAVING COUNT(*) > 1`;

    console.log('Duplicate Customer Names:', customerNames);
    console.log('Duplicate Supplier Names:', supplierNames);
    console.log('Duplicate Inventory Names:', inventoryNames);
    console.log('Duplicate Customer Phones:', customerPhones);
}

main().catch(console.error).finally(() => prisma.$disconnect());
