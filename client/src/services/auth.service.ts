import { httpClient } from '../api/httpClient';
import type { ApiResponse } from '../types/api';
import type { AuthUser } from '../types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: AuthUser;
}

export const authService = {
  register: (payload: RegisterPayload) =>
    httpClient.post<ApiResponse<LoginResponseData>>('/auth/register', payload),
  login: (payload: LoginPayload) =>
    httpClient.post<ApiResponse<LoginResponseData>>('/auth/login', payload),
};
