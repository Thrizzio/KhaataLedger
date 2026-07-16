-- Add soft-delete timestamps to Khata & KhataEntry so they can be soft-deleted
-- (consistent with Transaction.deletedAt).
ALTER TABLE "Khata" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "KhataEntry" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Generalize AuditLog to also record Khata mutations (every CREATE/UPDATE/DELETE
-- produces an audit entry). khataId is nullable so transaction audits are unaffected.
ALTER TABLE "AuditLog" ADD COLUMN "khataId" TEXT;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_khataId_fkey" FOREIGN KEY ("khataId") REFERENCES "Khata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "AuditLog_khataId_idx" ON "AuditLog"("khataId");
