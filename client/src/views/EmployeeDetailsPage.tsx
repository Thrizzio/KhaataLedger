"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { workspaceService } from '../services/workspace.service';
import { useAuth } from '../hooks/useAuth';
import { Permission } from '../types/auth';
import type { Employee } from '../types/workspace';

interface EmployeeDetailsPageProps {
    workspaceId: string;
    employeeId: string;
}

const PERMISSION_GROUPS = [
    {
        title: 'Inventory',
        permissions: [
            { key: Permission.INVENTORY_VIEW, label: 'View Inventory' },
            { key: Permission.INVENTORY_CREATE, label: 'Create Inventory Items' },
            { key: Permission.INVENTORY_EDIT, label: 'Edit Inventory Items' },
            { key: Permission.INVENTORY_DELETE, label: 'Delete Inventory Items' },
        ],
    },
    {
        title: 'Sales',
        permissions: [
            { key: Permission.SALES_VIEW, label: 'View Sales' },
            { key: Permission.SALES_RECORD, label: 'Record Sales' },
            { key: Permission.SALES_CANCEL, label: 'Cancel Sales' },
            { key: Permission.SALES_VIEW_DETAILS, label: 'View Sale Details' },
        ],
    },
    {
        title: 'Purchases',
        permissions: [
            { key: Permission.PURCHASES_VIEW, label: 'View Purchases' },
            { key: Permission.PURCHASES_RECORD, label: 'Record Purchases' },
            { key: Permission.PURCHASES_CANCEL, label: 'Cancel Purchases' },
        ],
    },
    {
        title: 'Customers',
        permissions: [
            { key: Permission.CUSTOMERS_VIEW, label: 'View Customers' },
            { key: Permission.CUSTOMERS_CREATE, label: 'Create Customers' },
            { key: Permission.CUSTOMERS_EDIT, label: 'Edit Customers' },
            { key: Permission.CUSTOMERS_DELETE, label: 'Delete Customers' },
        ],
    },
    {
        title: 'Suppliers',
        permissions: [
            { key: Permission.SUPPLIERS_VIEW, label: 'View Suppliers' },
            { key: Permission.SUPPLIERS_CREATE, label: 'Create Suppliers' },
            { key: Permission.SUPPLIERS_EDIT, label: 'Edit Suppliers' },
            { key: Permission.SUPPLIERS_DELETE, label: 'Delete Suppliers' },
        ],
    },
    {
        title: 'Payments',
        permissions: [
            { key: Permission.PAYMENTS_CUSTOMER_VIEW, label: 'View Customer Payments' },
            { key: Permission.PAYMENTS_CUSTOMER_RECORD, label: 'Record Customer Payments' },
            { key: Permission.PAYMENTS_SUPPLIER_VIEW, label: 'View Supplier Payments' },
            { key: Permission.PAYMENTS_SUPPLIER_RECORD, label: 'Record Supplier Payments' },
        ],
    },
    {
        title: 'General',
        permissions: [
            { key: Permission.DASHBOARD_VIEW, label: 'View Dashboard' },
            { key: Permission.EMPLOYEES_VIEW, label: 'View Employees' },
        ],
    },
];

export const EmployeeDetailsPage = ({ workspaceId, employeeId }: EmployeeDetailsPageProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isOwner = user?.role === 'OWNER';

    const { data: employee, isLoading, isError } = useQuery<Employee>({
        queryKey: ['employee', employeeId],
        queryFn: () => workspaceService.getEmployee(workspaceId, employeeId).then(r => {
            if (!r.data.data) throw new Error('Employee not found');
            return r.data.data;
        }),
    });

    const updatePermissionsMutation = useMutation({
        mutationFn: (newPermissions: string[]) => workspaceService.updateEmployeePermissions(workspaceId, employeeId, newPermissions),
        onSuccess: () => {
            toast.success('Permissions updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
        },
        onError: () => {
            toast.error('Failed to update permissions.');
        }
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !employee) {
        return (
            <Box py={4} textAlign="center">
                <Typography color="error">Failed to load employee details.</Typography>
                <Button onClick={() => router.back()} sx={{ mt: 2 }}>Go Back</Button>
            </Box>
        );
    }

    const currentPermissions = employee.permissions || [];

    const togglePermission = (permissionKey: string) => {
        if (!isOwner) return;
        const newPermissions = currentPermissions.includes(permissionKey)
            ? currentPermissions.filter(p => p !== permissionKey)
            : [...currentPermissions, permissionKey];
        updatePermissionsMutation.mutate(newPermissions);
    };

    return (
        <Stack spacing={4}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
                    Back to Employees
                </Button>
            </Stack>

            <Card sx={{ p: 4, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32 }}>
                        {employee.name[0]?.toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            {employee.name}
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography color="text.secondary">{employee.email}</Typography>
                            <Chip label={employee.role} size="small" color="primary" variant="outlined" />
                            {employee.employeeId && (
                                <Chip label={`ID: ${employee.employeeId}`} size="small" variant="outlined" />
                            )}
                        </Stack>
                    </Box>
                </Stack>
            </Card>

            <Box>
                <Typography variant="h5" fontWeight={600} mb={3}>
                    Permission Management
                </Typography>
                {!isOwner && (
                    <Typography color="text.secondary" mb={2}>
                        Only owners can modify permissions.
                    </Typography>
                )}
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    {PERMISSION_GROUPS.map(group => (
                        <Card key={group.title} sx={{ p: 3, borderRadius: 2 }} variant="outlined">
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {group.title}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={1}>
                                {group.permissions.map(perm => (
                                    <FormControlLabel
                                        key={perm.key}
                                        control={
                                            <Switch
                                                checked={currentPermissions.includes(perm.key)}
                                                onChange={() => togglePermission(perm.key)}
                                                disabled={!isOwner || updatePermissionsMutation.isPending}
                                                color="primary"
                                            />
                                        }
                                        label={perm.label}
                                    />
                                ))}
                            </Stack>
                        </Card>
                    ))}
                </Box>
            </Box>
        </Stack>
    );
};
