"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * /employees — redirect shim for the (protected) layout.
 *
 * The old sidebar has no workspaceId in its URL, so it links here.
 * We read the owner's first workspace from auth and redirect to the
 * proper workspace-scoped employees page.
 */
export default function EmployeesRedirectPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        if (user?.role === 'EMPLOYEE' && user.workspaceId) {
            // Employees go directly to their workspace employees page
            router.replace(`/workspaces/${user.workspaceId}/employees`);
            return;
        }

        // Owners: redirect to workspace list so they can pick a workspace
        router.replace('/workspaces');
    }, [isAuthenticated, user, router]);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
            <CircularProgress />
            <Typography color="text.secondary" variant="body2">
                Redirecting to employees…
            </Typography>
        </Box>
    );
}
