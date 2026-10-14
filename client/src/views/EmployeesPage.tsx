"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import toast from 'react-hot-toast';
import { EmployeeDialog } from '../components/EmployeeDialog';
import type { CreateEmployeePayload, Employee } from '../types/workspace';

import { useAuth } from '../hooks/useAuth';
import { PageShell } from './PageShell';
import { PageHeader } from '../shared/components/PageHeader';
import { SectionCard } from '../shared/components/SectionCard';
import { EmptyState } from '../shared/components/EmptyState';
import { UnauthorizedView } from '../components/UnauthorizedView';
import { Permission } from '../types/auth';
import { usePermission } from '../hooks/usePermission';
import { workspaceService } from '../services/workspace.service';
import { getApiErrorDetails } from '../api/apiError';

interface EmployeesPageProps {
    workspaceId: string;
}

export const EmployeesPage = ({ workspaceId }: EmployeesPageProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const { data: employees, isLoading, isError, refetch } = useQuery<Employee[]>({
        queryKey: ['employees', workspaceId],
        queryFn: () =>
            workspaceService.getEmployees(workspaceId).then((r) => r.data.data ?? []),
    });

    const { hasPermission } = usePermission();

    if (!hasPermission(Permission.EMPLOYEES_VIEW)) {
        return (
            <PageShell workspaceId={workspaceId}>
                <UnauthorizedView />
            </PageShell>
        );
    }



    const createMutation = useMutation({
        mutationFn: (payload: CreateEmployeePayload) =>
            workspaceService.createEmployee(workspaceId, payload),
        onSuccess: (response) => {
            toast.success(response?.data?.message || 'Employee created!');
            queryClient.invalidateQueries({ queryKey: ['employees', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            setDialogOpen(false);
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorDetails(error, 'Failed to create employee.').message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: { employeeId: string, permissions: string[] }) =>
            workspaceService.updateEmployeePermissions(workspaceId, payload.employeeId, payload.permissions),
        onSuccess: () => {
            toast.success('Permissions updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['employees', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['employee'] });
            setDialogOpen(false);
            setEditingEmployee(null);
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorDetails(error, 'Failed to update permissions.').message);
        }
    });

    const onSubmit = (values: CreateEmployeePayload & { permissions: string[] }) => {
        if (editingEmployee) {
            updateMutation.mutate({ employeeId: editingEmployee.id, permissions: values.permissions });
        } else {
            createMutation.mutate(values);
        }
    };

    const handleClose = () => {
        setDialogOpen(false);
        setEditingEmployee(null);
    };

    const handleEdit = (employee: Employee, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingEmployee(employee);
        setDialogOpen(true);
    };

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Employees"
                subtitle="Manage workspace employees and their access. Employees cannot register themselves."
                action={user?.role === 'OWNER' ? (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                        Add Employee
                    </Button>
                ) : undefined}
            />

            {/* Table */}
            <SectionCard title="Workspace employees">
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Box py={4} textAlign="center">
                        <Typography color="error" gutterBottom>Employees could not be loaded.</Typography>
                        <Button variant="outlined" onClick={() => refetch()}>Retry</Button>
                    </Box>
                ) : !employees || employees.length === 0 ? (
                    <EmptyState
                        icon={<PersonIcon />}
                        title="No employees yet"
                        description="Add an employee to share workspace access and assign permissions."
                        action={user?.role === 'OWNER' ? (
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                                Add First Employee
                            </Button>
                        ) : undefined}
                    />
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Joined</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.map((emp) => (
                                    <TableRow key={emp.id} hover>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.main', fontSize: 14 }}>
                                                    {emp.name[0]?.toUpperCase()}
                                                </Avatar>
                                                <Typography fontWeight={500} color="primary.main">{emp.name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>
                                            <Chip label="Employee" size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(emp.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            {user?.role === 'OWNER' && (
                                                <Button size="small" startIcon={<EditIcon />} onClick={(e) => handleEdit(emp, e)}>
                                                    Edit
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </SectionCard>

            <EmployeeDialog
                open={dialogOpen}
                onClose={handleClose}
                onSubmit={onSubmit}
                isPending={createMutation.isPending || updateMutation.isPending}
                initialData={editingEmployee}
            />
        </PageShell>
    );
};
