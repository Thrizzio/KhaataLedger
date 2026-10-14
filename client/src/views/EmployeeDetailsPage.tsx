"use client";

import { useState, useEffect } from 'react';
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
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { workspaceService } from '../services/workspace.service';
import { useAuth } from '../hooks/useAuth';
import { Permission } from '../types/auth';
import type { Employee } from '../types/workspace';
import { PageShell } from './PageShell';
import { PageHeader } from '../shared/components/PageHeader';

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

    const [localPermissions, setLocalPermissions] = useState<string[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const { data: employee, isLoading, isError, refetch } = useQuery<Employee>({
        queryKey: ['employee', employeeId],
        queryFn: () => workspaceService.getEmployee(workspaceId, employeeId).then(r => {
            if (!r.data.data) throw new Error('Employee not found');
            return r.data.data;
        }),
    });

    useEffect(() => {
        if (employee) {
            setLocalPermissions(employee.permissions || []);
            setHasUnsavedChanges(false);
        }
    }, [employee]);

    const updatePermissionsMutation = useMutation({
        mutationFn: (newPermissions: string[]) => workspaceService.updateEmployeePermissions(workspaceId, employeeId, newPermissions),
        onSuccess: () => {
          toast.success('Permissions updated successfully!');

          queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
          queryClient.invalidateQueries({ queryKey: ['employees', workspaceId] });

          setHasUnsavedChanges(false);
      },
        onError: () => {
            toast.error('Failed to update permissions.');
        }
    });

    if (isLoading) {
        return (
            <PageShell workspaceId={workspaceId}>
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                </Box>
            </PageShell>
        );
    }

    if (isError) {
        return (
            <PageShell workspaceId={workspaceId}>
                <PageHeader title="Employee unavailable" subtitle="We couldn’t load this employee right now." />
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>} sx={{ mb: 2 }}>
                    Employee details could not be loaded.
                </Alert>
                <Button onClick={() => router.back()}>Go Back</Button>
            </PageShell>
        );
    }

    if (!employee) {
        return (
            <PageShell workspaceId={workspaceId}>
                <PageHeader title="Employee not found" subtitle="This employee may have been removed or the link may be incorrect." />
                <Button onClick={() => router.back()}>Go Back</Button>
            </PageShell>
        );
    }

    const togglePermission = (permissionKey: string) => {
        if (!isOwner) return;
        const newPermissions = localPermissions.includes(permissionKey)
            ? localPermissions.filter(p => p !== permissionKey)
            : [...localPermissions, permissionKey];
        
        setLocalPermissions(newPermissions);
        setHasUnsavedChanges(true);
    };

    const handleSaveChanges = () => {
        if (!isOwner) return;
        updatePermissionsMutation.mutate(localPermissions);
    };

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Employee details"
                subtitle="Review workspace access and update permissions when needed."
                action={<Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>Back to Employees</Button>}
            />
            <Stack spacing={4}>
            {/* Header */}
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
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h5" fontWeight={600}>
                            Permission Management
                        </Typography>
                        {!isOwner && (
                            <Typography color="text.secondary" mt={1}>
                                Only owners can modify permissions.
                            </Typography>
                        )}
                    </Box>
                    {isOwner && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveChanges}
                            disabled={!hasUnsavedChanges || updatePermissionsMutation.isPending}
                        >
                            {updatePermissionsMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </Stack>
                
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
                                                checked={localPermissions.includes(perm.key)}
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
        </PageShell>
    );
};
