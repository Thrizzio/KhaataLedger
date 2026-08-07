import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type { ReportsData, ReportPeriod } from '../types';

export const reportsApi = {
    getReports: (workspaceId: string, period: ReportPeriod) =>
        httpClient.get<ApiResponse<ReportsData>>(`/workspaces/${workspaceId}/reports`, {
            params: { period },
        }),
};
