import type { AuthUser } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const authState: AuthState = {
  user: null,
  token: localStorage.getItem('ledger_access_token'),
};

export const getAuthState = (): AuthState => authState;

export const setAuthToken = (token: string | null): void => {
  authState.token = token;

  if (token) {
    localStorage.setItem('ledger_access_token', token);
    return;
  }

  localStorage.removeItem('ledger_access_token');
};
