import axios, { isAxiosError } from 'axios';
import { ApiError, getApiErrorDetails } from './apiError';
import { setAuthData } from '../store/authStore';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const httpClient = axios.create({
  baseURL,
  timeout: 15000,
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

    const details = getApiErrorDetails(error, '');
    const status = details.status;
    const requestUrl = error.config?.url ?? '';
    const isAuthenticationRequest = /\/auth\/(login|register)/.test(requestUrl);

    // 401 — session expired / not authenticated
    if (status === 401) {
      if (!isAuthenticationRequest) {
        setAuthData(null, null);
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      }
      throw new ApiError(
        401,
        isAuthenticationRequest
          ? details.message || 'Invalid email or password.'
          : 'Your session has expired. Please log in again.',
        details.fieldErrors,
        details.code,
      );
    }

    // 403 — forbidden
    if (status === 403) {
      const message = details.message && !/^forbidden$/i.test(details.message)
        ? details.message
        : 'You do not have permission to do that.';
      if (!isAuthenticationRequest) showSnackbar({ message, severity: 'error' });
      throw new ApiError(403, message, details.fieldErrors, details.code);
    }

    // 404 — let the caller handle
    if (status === 404) {
      throw new ApiError(404, details.message || 'Resource not found.', details.fieldErrors, details.code);
    }

    // 400 / 422 — validation errors (let caller handle, but surface message)
    if (status === 400 || status === 422) {
      throw new ApiError(status, details.message || 'Validation error.', details.fieldErrors, details.code);
    }

    // 409 — conflict (duplicate or stale resource)
    if (status === 409) {
      const message = details.message && !/^conflict$/i.test(details.message)
        ? details.message
        : 'This request conflicts with existing data. Check your changes and try again.';
      if (!isAuthenticationRequest) showSnackbar({ message, severity: 'error' });
      throw new ApiError(409, message, details.fieldErrors, details.code);
    }

    // 429 — rate limited; preserve a server-provided retry hint when present.
    if (status === 429) {
      const message = details.message || 'Too many requests. Please wait a moment and try again.';
      showSnackbar({ message, severity: 'error' });
      throw new ApiError(429, message, details.fieldErrors, details.code);
    }

    // 5xx — server error
    if (status >= 500) {
      const message = details.message && !/^internal server error$/i.test(details.message)
        ? details.message
        : 'The server is temporarily unavailable. Please try again later.';
      if (!isAuthenticationRequest) showSnackbar({ message, severity: 'error' });
      throw new ApiError(status, message, details.fieldErrors, details.code);
    }

    // Network / offline
    if (!error.response) {
      const message = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
        ? 'The request timed out. Check your connection and try again.'
        : 'Unable to reach the server. Check your connection and try again.';
      if (!isAuthenticationRequest) showSnackbar({ message, severity: 'error' });
      throw new ApiError(0, message, undefined, error.code);
    }

    throw new ApiError(status, details.message || 'Request failed. Please try again.', details.fieldErrors, details.code);
  },
);
