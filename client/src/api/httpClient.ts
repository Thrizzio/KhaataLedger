import axios, { isAxiosError } from 'axios';
import { ApiError } from './apiError';
import { setAuthData } from '../store/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const httpClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: attach JWT ────────────────────────────────────────────────────────
httpClient.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('ledger_access_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: handle errors globally ──────────────────────────────────────────
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Lazy import so there is no circular dep before SnackbarProvider is mounted
    const { showSnackbar } = await import('../lib/snackbar');

    if (!isAxiosError(error)) {
      showSnackbar({ message: 'An unexpected error occurred.', severity: 'error' });
      throw new ApiError(0, 'An unexpected error occurred.');
    }

    const status = error.response?.status ?? 0;
    const serverMessage: string =
      (error.response?.data as { message?: string })?.message ?? '';
    const fieldErrors =
      (error.response?.data as { error?: { fieldErrors?: Record<string, string[]> } })
        ?.error?.fieldErrors;

    // 401 — session expired / not authenticated
    if (status === 401) {
      setAuthData(null, null);
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
      throw new ApiError(401, 'Session expired. Please log in again.');
    }

    // 403 — forbidden
    if (status === 403) {
      showSnackbar({ message: serverMessage || 'You do not have permission to do that.', severity: 'error' });
      throw new ApiError(403, serverMessage || 'Forbidden.');
    }

    // 404 — let the caller handle
    if (status === 404) {
      throw new ApiError(404, serverMessage || 'Resource not found.', fieldErrors);
    }

    // 400 / 422 — validation errors (let caller handle, but surface message)
    if (status === 400 || status === 422) {
      throw new ApiError(status, serverMessage || 'Validation error.', fieldErrors);
    }

    // 5xx — server error
    if (status >= 500) {
      showSnackbar({ message: 'Server error — please try again later.', severity: 'error' });
      throw new ApiError(status, serverMessage || 'Internal server error.');
    }

    // Network / offline
    if (!error.response) {
      showSnackbar({ message: 'Network error — check your connection.', severity: 'error' });
      throw new ApiError(0, 'Network error.');
    }

    throw new ApiError(status, serverMessage || 'Request failed.');
  },
);

