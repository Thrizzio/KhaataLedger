"use client";

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { setAuthData } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import NextLink from './NextLink';

interface WorkspaceNavbarProps {
    onMenuClick: () => void;
    workspaceName: string;
    userName: string;
    workspaceId: string;
}

export const WorkspaceNavbar = ({
    onMenuClick,
    workspaceName,
    userName,
    workspaceId: _workspaceId,
}: WorkspaceNavbarProps) => {
    const router = useRouter();
    const { user } = useAuth();

    const handleLogout = () => {
        setAuthData(null, null);
        router.replace('/login');
    };

    return (
        <AppBar color="inherit" elevation={0} position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
                <IconButton
                    aria-label="Open navigation"
                    color="primary"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ display: { md: 'none' }, mr: 1 }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Back to workspaces (owner only) */}
                {user?.role === 'OWNER' && (
                    <Tooltip title="All workspaces">
                        <IconButton
                            component={NextLink}
                            href="/workspaces"
                            size="small"
                            sx={{ mr: 1, display: { xs: 'none', md: 'inline-flex' } }}
                        >
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}

                <Box sx={{ flexGrow: 1 }}>
                    <Typography color="primary" fontWeight={700} variant="h6" noWrap>
                        {workspaceName}
                    </Typography>
                    <Typography color="text.secondary" variant="caption" noWrap>
                        Khaata Ledger
                    </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                        {userName?.[0]?.toUpperCase() ?? 'U'}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500} sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {userName}
                    </Typography>
                    <Tooltip title="Logout">
                        <IconButton onClick={handleLogout} size="small">
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};
