"use client";

import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { usePathname, useRouter } from 'next/navigation';
import NextLink from './NextLink';
import type { UserRole } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { usePermission } from '../hooks/usePermission';
import { setAuthData } from '../store/authStore';
import { useWorkspace } from '../hooks/useWorkspace';

interface WorkspaceSidebarProps {
    workspaceId: string;
    mobileOpen: boolean;
    onClose: () => void;
    userRole?: UserRole;
    drawerWidth: number;
}

import { Permission } from '../types/auth';

import HistoryIcon from '@mui/icons-material/History';

const getNavItems = (workspaceId: string, role?: UserRole, hasPermission?: (p: Permission) => boolean) => {
    const base = `/workspaces/${workspaceId}`;
    const ownerItems = [
        { label: 'Dashboard', path: `${base}/dashboard`, icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
        { label: 'Inventory', path: `${base}/inventory`, icon: <Inventory2Icon sx={{ fontSize: 20 }} /> },
        { label: 'Customers', path: `${base}/customers`, icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
        { label: 'Suppliers', path: `${base}/suppliers`, icon: <LocalShippingIcon sx={{ fontSize: 20 }} /> },
        { label: 'Purchases', path: `${base}/purchases`, icon: <ShoppingCartIcon sx={{ fontSize: 20 }} /> },
        { label: 'Sales', path: `${base}/sales`, icon: <PointOfSaleIcon sx={{ fontSize: 20 }} /> },
        { label: 'Reports', path: `${base}/reports`, icon: <AssessmentIcon sx={{ fontSize: 20 }} /> },
        { label: 'Payments', path: `${base}/payments`, icon: <PaymentsIcon sx={{ fontSize: 20 }} /> },
        { label: 'Employees', path: `${base}/employees`, icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
        { label: 'Settings', path: `${base}/settings`, icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
        { label: 'Audit Logs', path: `${base}/audit-logs`, icon: <HistoryIcon sx={{ fontSize: 20 }} /> },
    ];

    if (role === 'OWNER') return ownerItems;

    const employeeItems = [];
    if (hasPermission?.(Permission.DASHBOARD_VIEW)) employeeItems.push({ label: 'Dashboard', path: `${base}/dashboard`, icon: <DashboardIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.INVENTORY_VIEW)) employeeItems.push({ label: 'Inventory', path: `${base}/inventory`, icon: <Inventory2Icon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.CUSTOMERS_VIEW)) employeeItems.push({ label: 'Customers', path: `${base}/customers`, icon: <PeopleIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.SUPPLIERS_VIEW)) employeeItems.push({ label: 'Suppliers', path: `${base}/suppliers`, icon: <LocalShippingIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.PURCHASES_VIEW)) employeeItems.push({ label: 'Purchases', path: `${base}/purchases`, icon: <ShoppingCartIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.SALES_VIEW)) employeeItems.push({ label: 'Sales', path: `${base}/sales`, icon: <PointOfSaleIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.REPORTS_VIEW)) employeeItems.push({ label: 'Reports', path: `${base}/reports`, icon: <AssessmentIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.PAYMENTS_CUSTOMER_VIEW) || hasPermission?.(Permission.PAYMENTS_SUPPLIER_VIEW)) employeeItems.push({ label: 'Payments', path: `${base}/payments`, icon: <PaymentsIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.EMPLOYEES_VIEW)) employeeItems.push({ label: 'Employees', path: `${base}/employees`, icon: <PeopleIcon sx={{ fontSize: 20 }} /> });
    if (hasPermission?.(Permission.SETTINGS_VIEW)) employeeItems.push({ label: 'Settings', path: `${base}/settings`, icon: <SettingsIcon sx={{ fontSize: 20 }} /> });
    
    // Add Audit Logs for employees. (Backend just checks workspace membership)
    employeeItems.push({ label: 'Audit Logs', path: `${base}/audit-logs`, icon: <HistoryIcon sx={{ fontSize: 20 }} /> });

    return employeeItems;
};

// Extracted so both mobile + desktop drawers share identical content
const DrawerContent = ({
    workspaceId,
    userRole,
    pathname,
}: {
    workspaceId: string;
    userRole?: UserRole;
    pathname: string | null;
}) => {
    const { user } = useAuth();
    const { hasPermission } = usePermission();
    const router = useRouter();
    const { clearWorkspaceId } = useWorkspace();
    const items = getNavItems(workspaceId, userRole, hasPermission);

    const handleLogout = () => {
        setAuthData(null, null);
        clearWorkspaceId();
        router.replace('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* ── Brand (doubles as Toolbar spacer, height matches AppBar) ── */}
            <Box sx={{ height: 64, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', fontSize: 13, fontWeight: 800 }}>
                    KL
                </Avatar>
                <Box>
                    <Typography fontSize={14} fontWeight={700} lineHeight={1.25} color="text.primary">
                        Khaata Ledger
                    </Typography>
                    <Typography fontSize={11} color="text.secondary" lineHeight={1.25}>
                        Digital Ledger
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* ── Nav Items ─────────────────────────────────────────────── */}
            <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
                {items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <ListItemButton
                            component={NextLink}
                            key={item.path}
                            href={item.path}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                py: 0.875,
                                px: 1.5,
                                minHeight: 44,
                                color: isActive ? 'primary.contrastText' : 'text.secondary',
                                bgcolor: isActive ? 'primary.main' : 'transparent',
                                '&:hover': {
                                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                                    color: isActive ? 'primary.contrastText' : 'text.primary',
                                    '& .MuiListItemIcon-root': { color: isActive ? 'primary.contrastText' : 'text.primary' },
                                },
                                '& .MuiListItemIcon-root': {
                                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                                    minWidth: 36,
                                    transition: 'color 0.15s',
                                },
                                transition: 'background-color 0.15s, color 0.15s',
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500 }}
                            />
                            {isActive && (
                                <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
                            )}
                        </ListItemButton>
                    );
                })}
            </List>

            {/* ── Profile ───────────────────────────────────────────────── */}
            <Divider />
            <Box sx={{ px: 2, py: 1.75 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontSize={13} fontWeight={600} lineHeight={1.3} noWrap color="text.primary">
                            {user?.name ?? '—'}
                        </Typography>
                        <Typography fontSize={11} color="text.secondary" lineHeight={1.3} sx={{ textTransform: 'capitalize' }}>
                            {user?.role?.toLowerCase() ?? 'user'}
                        </Typography>
                    </Box>
                    <Tooltip title="Logout">
                        <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary', flexShrink: 0 }}>
                            <LogoutIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

        </Box>
    );
};

export const WorkspaceSidebar = ({ workspaceId, mobileOpen, onClose, userRole, drawerWidth }: WorkspaceSidebarProps) => {
    const pathname = usePathname();
    const content = <DrawerContent workspaceId={workspaceId} userRole={userRole} pathname={pathname} />;

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* Mobile */}
            <Drawer
                ModalProps={{ keepMounted: true }}
                onClose={onClose}
                open={mobileOpen}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', boxShadow: '4px 0 20px rgba(0,0,0,0.08)' },
                }}
                variant="temporary"
            >
                {content}
            </Drawer>
            {/* Desktop */}
            <Drawer
                open
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
                }}
                variant="permanent"
            >
                {content}
            </Drawer>
        </Box>
    );
};
