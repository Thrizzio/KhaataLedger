import { getAuthState } from '../store/authStore';

export const useAuth = () => {
  const { token, user } = getAuthState();

  return {
    isAuthenticated: Boolean(token),
    token,
    user,
  };
};
