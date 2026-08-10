import type { Prisma } from "@prisma/client";

export const recordAudit = (
  tx: Prisma.TransactionClient,
  input: {
    workspaceId: string;
    action: "CREATE" | "UPDATE" | "DELETE";
    userId: string;
    transactionId?: string;
    khataId?: string;
    entityType?: string;
    entityId?: string;
    entityTitle?: string;
    previousValue: any | null;
    newValue: any;
  },
) =>
  tx.auditLog.create({
    data: {
      workspaceId: input.workspaceId,
      action: input.action,
      userId: input.userId,
      transactionId: input.transactionId,
      khataId: input.khataId,
      entityType: input.entityType,
      entityId: input.entityId,
      entityTitle: input.entityTitle,
      previousValue: input.previousValue ?? undefined,
      newValue: input.newValue,
    },
  });
