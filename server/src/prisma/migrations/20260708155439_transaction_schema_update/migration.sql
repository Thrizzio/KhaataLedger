-- Create enum if it is missing.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuditAction') THEN
    CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');
  END IF;
END $$;

-- Create the category table.
CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "defaultType" "TransactionType",
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");

-- Align the transaction enum with the current Prisma schema.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TransactionType_new') THEN
    CREATE TYPE "TransactionType_new" AS ENUM ('INCOME', 'EXPENSE');
    ALTER TABLE "Category" ALTER COLUMN "defaultType" TYPE "TransactionType_new" USING ("defaultType"::text::"TransactionType_new");
    ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING (
      CASE
        WHEN "type"::text = 'CREDIT' THEN 'INCOME'::"TransactionType_new"
        WHEN "type"::text = 'DEBIT' THEN 'EXPENSE'::"TransactionType_new"
        ELSE 'EXPENSE'::"TransactionType_new"
      END
    );
    DROP TYPE "TransactionType";
    ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
  END IF;
END $$;

-- Add the new transaction columns and backfill them.
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "transactionDate" TIMESTAMP(3);
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "version" INTEGER;

UPDATE "Transaction" SET "title" = COALESCE("title", 'Untitled') WHERE "title" IS NULL;
UPDATE "Transaction" SET "transactionDate" = COALESCE("transactionDate", CURRENT_TIMESTAMP) WHERE "transactionDate" IS NULL;
UPDATE "Transaction" SET "categoryId" = '00000000-0000-0000-0000-000000000000' WHERE "categoryId" IS NULL;
UPDATE "Transaction" SET "version" = COALESCE("version", 1) WHERE "version" IS NULL;

ALTER TABLE "Transaction" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "transactionDate" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "version" SET DEFAULT 1;
ALTER TABLE "Transaction" ALTER COLUMN "version" SET NOT NULL;

-- Remove the legacy customer relation from the transaction table.
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_customerId_fkey";
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "customerId";
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "note";

-- Add the category relation.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_categoryId_fkey') THEN
    ALTER TABLE "Transaction"
      ADD CONSTRAINT "Transaction_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Create a default category row for existing rows.
INSERT INTO "Category" ("id", "name", "defaultType", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000000', 'Uncategorized', 'EXPENSE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
