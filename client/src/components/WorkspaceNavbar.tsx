"use client";

import MenuIcon from '@mui/icons-material/Menu';
import StoreIcon from '@mui/icons-material/Store';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { workspaceService } from '../services/workspace.service';
import { useAuth } from '../hooks/useAuth';
import type { Workspace } from '../types/workspace';

interface WorkspaceNavbarProps {
    onMenuClick: () => void;
    /** Current workspace name (for display while workspaces list loads) */
    workspaceName: string;
    workspaceId: string;
}

export const WorkspaceNavbar = ({
    onMenuClick,
    workspaceName,
    workspaceId,
}: WorkspaceNavbarProps) => {
    const router = useRouter();
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // Owners see the workspace switcher; employees don't need it
    const isOwner = user?.role === 'OWNER';

    const { data: workspaces, isLoading } = useQuery<Workspace[]>({
        queryKey: ['workspaces'],
        queryFn: () => workspaceService.getWorkspaces().then((r) => r.data.data as Workspace[]),
        enabled: isOwner,
    });

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSelect = (id: string) => {
        handleClose();
        if (id !== workspaceId) {
            router.push(`/workspaces/${id}/dashboard`);
        }
    };

    return (
        <AppBar
            color="inherit"
            elevation={0}
            position="sticky"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
            <Toolbar sx={{ gap: 1 }}>
                {/* Hamburger — mobile only */}
                <IconButton
                    aria-label="Open navigation"
                    color="inherit"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ display: { md: 'none' }, mr: 0.5 }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}>Workspace</Typography>
                    <Typography fontWeight={750} fontSize={{ xs: 14, sm: 15 }} noWrap sx={{ maxWidth: { xs: 150, sm: 280 } }}>
                        {workspaceName}
                    </Typography>
                </Box>

                {/* ── Workspace Selector ─────────────────────── */}
                {isOwner ? (
                    <>
                        <Button
                            id="workspace-selector-button"
                            aria-controls={open ? 'workspace-selector-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleOpen}
                            startIcon={<StoreIcon fontSize="small" />}
                            endIcon={
                                isLoading
                                    ? <CircularProgress size={14} />
                                    : <KeyboardArrowDownIcon fontSize="small" />
                            }
                            color="inherit"
                             sx={{
                                 textTransform: 'none',
                                fontWeight: 600,
                                fontSize: 14,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                px: 1.5,
                                py: 0.75,
                                 '&:hover': { bgcolor: 'rgba(15, 138, 131, 0.08)', borderColor: 'secondary.main' },
                             }}
                        >
                            <Typography
                                noWrap
                                fontWeight={600}
                                fontSize={14}
                                sx={{ maxWidth: { xs: 120, sm: 200 } }}
                            >
                                {workspaceName}
                            </Typography>
                        </Button>

                        <Menu
                            id="workspace-selector-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            MenuListProps={{ 'aria-labelledby': 'workspace-selector-button' }}
                            PaperProps={{
                                elevation: 2,
                                sx: { mt: 0.5, minWidth: 240, borderRadius: 2 },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            {/* Workspace list */}
                            {workspaces?.map((ws) => {
                                const isCurrentWs = ws.id === workspaceId;
                                return (
                                    <MenuItem
                                        key={ws.id}
                                        selected={isCurrentWs}
                                        onClick={() => handleSelect(ws.id)}
                                        sx={{ fontSize: 14, fontWeight: isCurrentWs ? 600 : 400, gap: 1 }}
                                    >
                                        <StoreIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
                                        <Typography fontSize={14} fontWeight={isCurrentWs ? 600 : 400} noWrap sx={{ flexGrow: 1 }}>
                                            {ws.name}
                                        </Typography>
                                        {isCurrentWs && <CheckIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />}
                                    </MenuItem>
                                );
                            })}

                            {/* Footer: Manage Workspaces */}
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem
                                onClick={() => { handleClose(); router.push('/workspaces'); }}
                                sx={{ fontSize: 14, color: 'text.secondary', gap: 1 }}
                            >
                                <OpenInNewIcon sx={{ fontSize: 16, flexShrink: 0 }} />
                                <Typography fontSize={14}>Manage Workspaces</Typography>
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    // Employees just see their workspace name (no switcher)
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                        <StoreIcon fontSize="small" />
                        <Typography fontWeight={650} fontSize={13} noWrap color="text.primary">
                            Team workspace
                        </Typography>
                    </Stack>
                )}
            </Toolbar>
        </AppBar>
    );
};
