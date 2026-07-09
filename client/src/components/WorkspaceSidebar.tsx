"use client";

import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import { usePathname } from 'next/navigation';
import NextLink from './NextLink';
import type { UserRole } from '../types/auth';

interface WorkspaceSidebarProps {
    workspaceId: string;
    mobileOpen: boolean;
    onClose: () => void;
    userRole?: UserRole;
    drawerWidth: number;
}

const getNavItems = (workspaceId: string, role?: UserRole) => {
    const base = `/workspaces/${workspaceId}`;

    const ownerItems = [
        { label: 'Dashboard', path: `${base}/dashboard`, icon: <DashboardIcon /> },
        { label: 'Expenses', path: `${base}/expenses`, icon: <ReceiptLongIcon /> },
        { label: 'Categories', path: `${base}/categories`, icon: <CategoryIcon /> },
        { label: 'Employees', path: `${base}/employees`, icon: <GroupIcon /> },
        { label: 'Reports', path: `${base}/reports`, icon: <AssessmentIcon /> },
        { label: 'Settings', path: `${base}/settings`, icon: <SettingsIcon /> },
    ];

    const employeeItems = [
        { label: 'Dashboard', path: `${base}/dashboard`, icon: <DashboardIcon /> },
        { label: 'Expenses', path: `${base}/expenses`, icon: <ReceiptLongIcon /> },
        { label: 'Categories', path: `${base}/categories`, icon: <CategoryIcon /> },
    ];

    return role === 'OWNER' ? ownerItems : employeeItems;
};

const NavList = ({
    workspaceId,
    userRole,
    pathname,
}: {
    workspaceId: string;
    userRole?: UserRole;
    pathname: string | null;
}) => {
    const items = getNavItems(workspaceId, userRole);

    return (
        <List sx={{ px: 1.5 }}>
            {items.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <ListItemButton
                        component={NextLink}
                        key={item.path}
                        href={item.path}
                        sx={{
                            borderRadius: 3,
                            mb: 0.5,
                            ...(isActive
                                ? {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                                }
                                : {}),
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                );
            })}
        </List>
    );
};

export const WorkspaceSidebar = ({
    workspaceId,
    mobileOpen,
    onClose,
    userRole,
    drawerWidth,
}: WorkspaceSidebarProps) => {
    const pathname = usePathname();

    const drawerContent = (
        <Box>
            <Toolbar />
            <NavList workspaceId={workspaceId} userRole={userRole} pathname={pathname} />
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* Mobile */}
            <Drawer
                ModalProps={{ keepMounted: true }}
                onClose={onClose}
                open={mobileOpen}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                variant="temporary"
            >
                {drawerContent}
            </Drawer>
            {/* Desktop */}
            <Drawer
                open
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                variant="permanent"
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};
