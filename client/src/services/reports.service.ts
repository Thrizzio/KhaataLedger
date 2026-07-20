import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';
import type { ReportsData, ReportRange } from '../types/report';

export const reportsService = {
  getReports: (workspaceId: string, range: ReportRange, startDate?: string, endDate?: string) =>
    httpClient.get<ApiResponse<ReportsData>>(`/workspaces/${workspaceId}/reports`, {
      params: {
        range,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    }),
};
