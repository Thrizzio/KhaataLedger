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

import { PERMISSION_GROUPS } from '../components/EmployeeDialog';

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
            queryClient.invalidateQueries({ queryKey: ['employee'] });
            queryClient.invalidateQueries({ queryKey: ['employees', workspaceId] });
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
