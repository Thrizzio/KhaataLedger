import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';
import type { Workspace, CreateEmployeePayload, Employee } from '../types/workspace';

export const workspaceService = {
    getWorkspaces: () =>
        httpClient.get<ApiResponse<Workspace[]>>('/workspaces'),

    createWorkspace: (name: string) =>
        httpClient.post<ApiResponse<Workspace>>('/workspaces', { name }),

    getWorkspaceById: (workspaceId: string) =>
        httpClient.get<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`),

    getEmployees: (workspaceId: string) =>
        httpClient.get<ApiResponse<Employee[]>>(`/workspaces/${workspaceId}/employees`),

    createEmployee: (workspaceId: string, payload: CreateEmployeePayload) =>
        httpClient.post<ApiResponse<Employee>>(`/workspaces/${workspaceId}/employees`, payload),
};
