-- CreateEnum
CREATE TYPE "KhataEntryType" AS ENUM ('CREDIT', 'PAYMENT');

-- CreateTable
CREATE TABLE "Khata" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "initialAmount" DECIMAL(12,2) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Khata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhataEntry" (
    "id" TEXT NOT NULL,
    "khataId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" "KhataEntryType" NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KhataEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Khata_workspaceId_idx" ON "Khata"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Khata_workspaceId_customerName_key" ON "Khata"("workspaceId", "customerName");

-- CreateIndex
CREATE INDEX "KhataEntry_khataId_idx" ON "KhataEntry"("khataId");

-- AddForeignKey
ALTER TABLE "Khata" ADD CONSTRAINT "Khata_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Khata" ADD CONSTRAINT "Khata_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KhataEntry" ADD CONSTRAINT "KhataEntry_khataId_fkey" FOREIGN KEY ("khataId") REFERENCES "Khata"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KhataEntry" ADD CONSTRAINT "KhataEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
