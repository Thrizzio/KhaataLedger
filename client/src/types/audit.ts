export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditUser {
  id: string;
  name: string;
  email: string;
}

export interface AuditWorkspace {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  transactionId: string | null;
  workspaceId: string;
  workspace?: AuditWorkspace | null;
  userId: string;
  user?: AuditUser | null;
  transaction?: { title: string | null } | null;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
}
