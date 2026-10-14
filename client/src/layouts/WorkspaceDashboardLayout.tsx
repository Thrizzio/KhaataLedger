"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { WorkspaceNavbar } from '../components/WorkspaceNavbar';
import { WorkspaceSidebar } from '../components/WorkspaceSidebar';
import { workspaceService } from '../services/workspace.service';
import { useAuth } from '../hooks/useAuth';
import type { Workspace } from '../types/workspace';

const drawerWidth = 264;

interface WorkspaceDashboardLayoutProps {
    children: ReactNode;
    workspaceId: string;
}

export const WorkspaceDashboardLayout = ({
    children,
    workspaceId,
}: WorkspaceDashboardLayoutProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: workspace } = useQuery<Workspace>({
        queryKey: ['workspace', workspaceId],
        queryFn: () =>
            workspaceService
                .getWorkspaceById(workspaceId)
                .then((r) => r.data.data as Workspace),
        enabled: Boolean(workspaceId),
    });

    return (
        // Outer: horizontal flex — sidebar | main column
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>

            {isMounted ? (
                <WorkspaceSidebar
                    workspaceId={workspaceId}
                    workspaceName={workspace?.name}
                    mobileOpen={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    userRole={user?.role}
                    drawerWidth={drawerWidth}
                />
            ) : (
                <Box sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} />
            )}

            {/* Main column: navbar on top, then scrollable content below */}
            <Box
                component="main"
                    sx={{
                        flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    // Offset for permanent sidebar on md+
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        backgroundColor: 'background.default',
                    }}
            >
                {/* AppBar is now INSIDE the main column → never overlapped by the sidebar */}
                <WorkspaceNavbar
                    onMenuClick={() => setMobileOpen(true)}
                    workspaceName={workspace?.name ?? '…'}
                    workspaceId={workspaceId}
                />

                <Box sx={{ flexGrow: 1 }}>
                        <Container
                            maxWidth={false}
                            disableGutters
                            sx={{ py: { xs: 2.5, sm: 3.5, md: 4.5 }, px: { xs: 2, sm: 3, md: 4, lg: 5 }, maxWidth: 1600, width: '100%', mx: 'auto' }}
                    >
                        {children}
                    </Container>
                </Box>
            </Box>

        </Box>
    );
};
