"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useAuth } from '../hooks/useAuth';
import { useWorkspace } from '../hooks/useWorkspace';
import { workspaceService } from '../services/workspace.service';
import { LandingPage } from '../views/LandingPage';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { workspaceId, setWorkspaceId, clearWorkspaceId } = useWorkspace();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: workspaces, isLoading: isWorkspacesLoading, isError } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces().then((r) => r.data.data ?? []),
    enabled: isAuthenticated && user?.role === 'OWNER',
    retry: false, // Don't retry if it fails (e.g., auth error)
  });

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) return;

    if (user?.role === 'EMPLOYEE') {
      if (user.workspaceId) {
        router.replace(`/workspaces/${user.workspaceId}/dashboard`);
      } else {
        router.replace('/login');
      }
      return;
    }

    // From here on, user is OWNER
    if (isWorkspacesLoading) return;

    if (isError || !workspaces) {
      router.replace('/workspaces');
      return;
    }

    if (workspaces.length === 0) {
      clearWorkspaceId();
      router.replace('/workspaces');
      return;
    }

    if (workspaces.length === 1) {
      const singleWorkspace = workspaces[0].id;
      if (workspaceId !== singleWorkspace) {
        setWorkspaceId(singleWorkspace);
      }
      router.replace(`/workspaces/${singleWorkspace}/dashboard`);
      return;
    }

    if (workspaces.length > 1) {
      if (workspaceId) {
        const isValid = workspaces.some((ws) => ws.id === workspaceId);
        if (isValid) {
          router.replace(`/workspaces/${workspaceId}/dashboard`);
          return;
        } else {
          // Stale or deleted workspace ID in store
          clearWorkspaceId();
        }
      }
      // Multiple workspaces exist and no valid selection found, let user pick
      router.replace('/workspaces');
      return;
    }

  }, [
    mounted,
    isAuthenticated,
    user,
    workspaces,
    isWorkspacesLoading,
    isError,
    workspaceId,
    setWorkspaceId,
    clearWorkspaceId,
    router,
  ]);

  if (!mounted) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}
