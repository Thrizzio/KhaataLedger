"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user?.role === 'OWNER') {
      router.replace('/workspaces');
    } else if (user?.role === 'EMPLOYEE' && user.workspaceId) {
      router.replace(`/workspaces/${user.workspaceId}/dashboard`);
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}
