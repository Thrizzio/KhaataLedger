import type { AuthUser } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const isClient = typeof window !== 'undefined';

const getStoredUser = (): AuthUser | null => {
  if (!isClient) return null;
  const userStr = localStorage.getItem('ledger_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
};

const authState: AuthState = {
  user: null,
  token: null,
};

const initAuthState = () => {
  if (!isClient) return;
  authState.user = getStoredUser();
  authState.token = localStorage.getItem('ledger_access_token');
};

const listeners = new Set<() => void>();

export const getAuthState = (): AuthState => {
  if (authState.token === null && authState.user === null) {
    initAuthState();
  }
  return authState;
};

export const setAuthData = (token: string | null, user: AuthUser | null): void => {
  authState.token = token;
  authState.user = user;

  if (!isClient) {
    listeners.forEach((listener) => listener());
    return;
  }

  if (token && user) {
    localStorage.setItem('ledger_access_token', token);
    localStorage.setItem('ledger_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('ledger_access_token');
    localStorage.removeItem('ledger_user');
  }

  listeners.forEach((listener) => listener());
};

export const setAuthToken = (token: string | null): void => {
  setAuthData(token, authState.user);
};

export const subscribeToAuth = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
