import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';
import type { AuditLog } from '../types/audit';

export const auditService = {
  /** Fetch all audit logs for a workspace, newest first */
  getAuditLogs: (workspaceId: string, entityType?: string) => {
    let url = `/audit?workspaceId=${workspaceId}`;
    if (entityType) {
      url += `&entityType=${entityType}`;
    }
    return httpClient.get<ApiResponse<AuditLog[]>>(url);
  },

  /** Fetch a single audit entry by id */
  getAuditLogById: (id: string) =>
    httpClient.get<ApiResponse<AuditLog>>(`/audit/${id}`),
};
