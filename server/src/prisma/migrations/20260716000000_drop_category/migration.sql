-- Drop the Category feature that was removed from schema.prisma but never
-- migrated. This reconciles the database with the current Prisma schema so
-- transaction inserts no longer fail on the (now non-existent) categoryId column.

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_categoryId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "categoryId";

-- DropTable
DROP TABLE IF EXISTS "Category";
