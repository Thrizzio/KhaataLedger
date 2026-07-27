import { httpClient } from '../../../api/httpClient';
import type { ApiResponse } from '../../../types/api';
import type { CreateCustomerPaymentPayload, CreateSupplierPaymentPayload } from '../types';

export const paymentApi = {
    createCustomerPayment: async (workspaceId: string, payload: CreateCustomerPaymentPayload) => {
        const response = await httpClient.post<ApiResponse<any>>(`/workspaces/${workspaceId}/customer-payments`, payload);
        return response.data.data;
    },

    createSupplierPayment: async (workspaceId: string, payload: CreateSupplierPaymentPayload) => {
        const response = await httpClient.post<ApiResponse<any>>(`/workspaces/${workspaceId}/supplier-payments`, payload);
        return response.data.data;
    },
};
