import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    httpClient.post<ApiResponse>('/auth/register', payload),
  login: (payload: LoginPayload) => httpClient.post<ApiResponse>('/auth/login', payload),
};
