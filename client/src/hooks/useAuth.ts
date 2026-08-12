import { useState, useEffect } from 'react';
import { getAuthState, subscribeToAuth } from '../store/authStore';

export const useAuth = () => {
  const [authState, setAuthState] = useState(getAuthState());

  useEffect(() => {
    const unsubscribe = subscribeToAuth(() => {
      setAuthState(getAuthState());
    });
    return unsubscribe;
  }, []);
//Manually making a change for delpotn
  return {
    isAuthenticated: Boolean(authState.token),
    token: authState.token,
    user: authState.user,
  };
};
