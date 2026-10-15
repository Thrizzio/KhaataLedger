/**
 * Normalizes an API base URL so that `/api` is neither omitted nor duplicated.
 * Trims whitespace, removes trailing slashes, and appends `/api` if missing.
 */
export const normalizeApiBaseUrl = (rawUrl?: string): string => {
  const fallback = 'http://localhost:5000/api';
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return fallback;
  }

  let trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed.endsWith('/api')) {
    trimmed = `${trimmed}/api`;
  }
  return trimmed;
};

/**
 * Sanitizes an in-app redirect path to prevent open redirects to external origins.
 */
export const sanitizeRedirectPath = (target: string | null | undefined): string => {
  return target && target.startsWith('/') && !target.startsWith('//') ? target : '/workspaces';
};
