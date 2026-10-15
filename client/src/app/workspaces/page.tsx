"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { WorkspacesPage } from '../../views/WorkspacesPage';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function WorkspacesRoute() {
    const [mounted, setMounted] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
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
    }, [mounted, isAuthenticated, user, router]);

    if (!mounted || !isAuthenticated || user?.role === 'EMPLOYEE') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return <WorkspacesPage />;
}
