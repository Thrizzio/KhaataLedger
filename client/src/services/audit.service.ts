import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';
import type { AuditLog } from '../types/audit';

export const auditService = {
  /** Fetch all audit logs for a workspace, newest first */
  getAuditLogs: (workspaceId: string) =>
    httpClient.get<ApiResponse<AuditLog[]>>(`/audit?workspaceId=${workspaceId}`),

  /** Fetch a single audit entry by id */
  getAuditLogById: (id: string) =>
    httpClient.get<ApiResponse<AuditLog>>(`/audit/${id}`),
};
