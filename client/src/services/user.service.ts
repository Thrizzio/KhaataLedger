import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';
import type { AuthUser } from '../types/auth';

export const userService = {
    updateProfile: (payload: { name: string; email: string; avatarUrl?: string | null }) =>
        httpClient.put<ApiResponse<AuthUser>>('/users/profile', payload),

    updatePassword: (payload: { currentPassword: string; newPassword: string }) =>
        httpClient.put<ApiResponse<null>>('/users/password', payload),

    updatePreferences: (preferences: any) =>
        httpClient.put<ApiResponse<any>>('/users/preferences', { preferences }),

    deleteAccount: () =>
        httpClient.delete<ApiResponse<null>>('/users/me'),
};
