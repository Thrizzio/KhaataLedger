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
    workspaceName?: string;
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
    workspaceName,
    userRole,
    pathname,
    onNavigate,
}: {
    workspaceId: string;
    workspaceName?: string;
    userRole?: UserRole;
    pathname: string | null;
    onNavigate?: () => void;
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
            <Box sx={{ px: 2.5, pt: 2.25, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                <Avatar sx={{ width: 38, height: 38, bgcolor: 'secondary.main', color: 'common.white', fontSize: 13, fontWeight: 800, boxShadow: '0 0 0 4px rgba(91,198,187,0.12)' }}>
                    KL
                </Avatar>
                <Box>
                    <Typography fontSize={14} fontWeight={750} lineHeight={1.25} color="common.white">
                        Khaata Ledger
                    </Typography>
                    <Typography fontSize={11} color="rgba(255,255,255,0.60)" lineHeight={1.25}>
                        Business workspace
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mx: 1.5, mb: 1.25, px: 1.25, py: 1.25, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.52)', display: 'block', lineHeight: 1.5 }}>Current workspace</Typography>
                <Typography noWrap fontSize={13} fontWeight={700} color="common.white" sx={{ mt: 0.25 }}>{workspaceName ?? 'Loading workspace…'}</Typography>
            </Box>

            {/* ── Nav Items ─────────────────────────────────────────────── */}
            <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
                {items.map((item) => {
                    const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
                    return (
                        <ListItemButton
                            component={NextLink}
                            key={item.path}
                            href={item.path}
                            onClick={onNavigate}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                py: 0.875,
                                px: 1.5,
                                minHeight: 44,
                                color: isActive ? 'common.white' : 'rgba(255,255,255,0.68)',
                                bgcolor: isActive ? 'rgba(91,198,187,0.18)' : 'transparent',
                                borderLeft: isActive ? '3px solid' : '3px solid transparent',
                                borderColor: isActive ? 'secondary.light' : 'transparent',
                                '&:hover': {
                                    bgcolor: isActive ? 'rgba(91,198,187,0.22)' : 'rgba(255,255,255,0.08)',
                                    color: 'common.white',
                                    '& .MuiListItemIcon-root': { color: 'common.white' },
                                },
                                '& .MuiListItemIcon-root': {
                                    color: isActive ? 'secondary.light' : 'rgba(255,255,255,0.54)',
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
                                <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.light', flexShrink: 0 }} />
                            )}
                        </ListItemButton>
                    );
                })}
            </List>

            {/* ── Profile ───────────────────────────────────────────────── */}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.10)' }} />
            <Box sx={{ px: 2, py: 1.75 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(255,255,255,0.16)', color: 'common.white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontSize={13} fontWeight={700} lineHeight={1.3} noWrap color="common.white">
                            {user?.name ?? '—'}
                        </Typography>
                        <Typography fontSize={11} color="rgba(255,255,255,0.58)" lineHeight={1.3} sx={{ textTransform: 'capitalize' }}>
                            {user?.role?.toLowerCase() ?? 'user'}
                        </Typography>
                    </Box>
                    <Tooltip title="Logout">
                        <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }} aria-label="Log out">
                            <LogoutIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

        </Box>
    );
};

export const WorkspaceSidebar = ({ workspaceId, workspaceName, mobileOpen, onClose, userRole, drawerWidth }: WorkspaceSidebarProps) => {
    const pathname = usePathname();
    const content = <DrawerContent workspaceId={workspaceId} workspaceName={workspaceName} userRole={userRole} pathname={pathname} onNavigate={onClose} />;

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* Mobile */}
            <Drawer
                ModalProps={{ keepMounted: true }}
                onClose={onClose}
                open={mobileOpen}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', backgroundColor: '#0B1F3A', color: '#fff', boxShadow: '8px 0 28px rgba(6,20,38,0.18)' },
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
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', backgroundColor: '#0B1F3A', color: '#fff' },
                }}
                variant="permanent"
            >
                {content}
            </Drawer>
        </Box>
    );
};
