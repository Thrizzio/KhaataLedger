import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type {
    Customer,
    CustomerListParams,
    CustomerListResponse,
    CreateCustomerPayload,
    UpdateCustomerPayload,
    CustomerLedgerResponse
} from '../types';

export const customerApi = {
    getCustomers: async (workspaceId: string, params: CustomerListParams) => {
        const response = await httpClient.get<ApiResponse<CustomerListResponse>>(`/workspaces/${workspaceId}/customers`, { params });
        return response.data.data!;
    },

    getCustomer: async (workspaceId: string, id: string) => {
        const response = await httpClient.get<ApiResponse<Customer>>(`/workspaces/${workspaceId}/customers/${id}`);
        return response.data.data!;
    },

    getCustomerLedger: async (workspaceId: string, id: string) => {
        const response = await httpClient.get<ApiResponse<CustomerLedgerResponse>>(`/workspaces/${workspaceId}/customers/${id}/ledger`);
        return response.data.data!;
    },

    createCustomer: async (workspaceId: string, payload: CreateCustomerPayload) => {
        const response = await httpClient.post<ApiResponse<Customer>>(`/workspaces/${workspaceId}/customers`, payload);
        return response.data.data!;
    },

    updateCustomer: async (workspaceId: string, id: string, payload: UpdateCustomerPayload) => {
        const response = await httpClient.patch<ApiResponse<Customer>>(`/workspaces/${workspaceId}/customers/${id}`, payload);
        return response.data.data!;
    },

    deleteCustomer: async (workspaceId: string, id: string) => {
        const response = await httpClient.delete<ApiResponse<Customer>>(`/workspaces/${workspaceId}/customers/${id}`);
        return response.data.data!;
    },
};
