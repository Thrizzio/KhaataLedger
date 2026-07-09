"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { WorkspacesPage } from '../../views/WorkspacesPage';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function WorkspacesRoute() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }
        // Employees should not see the workspace list
        if (user?.role === 'EMPLOYEE') {
            if (user.workspaceId) {
                router.replace(`/workspaces/${user.workspaceId}/dashboard`);
            } else {
                router.replace('/login');
            }
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role === 'EMPLOYEE') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return <WorkspacesPage />;
}
