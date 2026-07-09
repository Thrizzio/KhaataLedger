"use client";

import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { WorkspaceNavbar } from '../components/WorkspaceNavbar';
import { WorkspaceSidebar } from '../components/WorkspaceSidebar';
import { workspaceService } from '../services/workspace.service';
import { useAuth } from '../hooks/useAuth';
import type { Workspace } from '../types/workspace';

const drawerWidth = 260;

interface WorkspaceDashboardLayoutProps {
    children: ReactNode;
    workspaceId: string;
}

export const WorkspaceDashboardLayout = ({
    children,
    workspaceId,
}: WorkspaceDashboardLayoutProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();

    const { data: workspace } = useQuery<Workspace>({
        queryKey: ['workspace', workspaceId],
        queryFn: () =>
            workspaceService
                .getWorkspaceById(workspaceId)
                .then((r) => r.data.data as Workspace),
        enabled: Boolean(workspaceId),
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <WorkspaceNavbar
                onMenuClick={() => setMobileOpen(true)}
                workspaceName={workspace?.name ?? '…'}
                userName={user?.name ?? ''}
                workspaceId={workspaceId}
            />

            <Box sx={{ display: 'flex', flexGrow: 1, width: '100%' }}>
                <WorkspaceSidebar
                    workspaceId={workspaceId}
                    mobileOpen={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    userRole={user?.role}
                    drawerWidth={drawerWidth}
                />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                    }}
                >
                    <Toolbar />
                    <Container
                        maxWidth={false}
                        disableGutters
                        sx={{
                            py: 4,
                            px: { xs: 2, sm: 3, md: 4 },
                        }}
                    >
                        {children}
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};
