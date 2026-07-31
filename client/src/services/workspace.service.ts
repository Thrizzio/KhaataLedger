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

    updateWorkspace: (workspaceId: string, name: string) =>
        httpClient.put<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`, { name }),

    deleteWorkspace: (workspaceId: string) =>
        httpClient.delete<ApiResponse<null>>(`/workspaces/${workspaceId}`),

    getEmployee: (workspaceId: string, employeeId: string) =>
        httpClient.get<ApiResponse<Employee>>(`/workspaces/${workspaceId}/employees/${employeeId}`),

    updateEmployeePermissions: (workspaceId: string, employeeId: string, permissions: string[]) =>
        httpClient.put<ApiResponse<Employee>>(`/workspaces/${workspaceId}/employees/${employeeId}/permissions`, { permissions }),
};
