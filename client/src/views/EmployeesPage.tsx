"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
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
import { UnauthorizedView } from '../components/UnauthorizedView';
import { Permission } from '../types/auth';
import { usePermission } from '../hooks/usePermission';
import { workspaceService } from '../services/workspace.service';

interface EmployeesPageProps {
    workspaceId: string;
}

export const EmployeesPage = ({ workspaceId }: EmployeesPageProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    const { data: employees, isLoading, isError } = useQuery<Employee[]>({
        queryKey: ['employees', workspaceId],
        queryFn: () =>
            workspaceService.getEmployees(workspaceId).then((r) => r.data.data ?? []),
    });

    const { hasPermission } = usePermission();

    if (!hasPermission(Permission.EMPLOYEES_VIEW)) {
        return <UnauthorizedView />;
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
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create employee.');
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
        onError: () => {
            toast.error('Failed to update permissions.');
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
        <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Employees
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        Manage workspace employees. Employees cannot register themselves.
                    </Typography>
                </Box>
                {user?.role === 'OWNER' && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                    >
                        Add Employee
                    </Button>
                )}
            </Stack>

            {/* Table */}
            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Box py={4} textAlign="center">
                        <Typography color="error">Failed to load employees.</Typography>
                    </Box>
                ) : !employees || employees.length === 0 ? (
                    <Box py={8} textAlign="center">
                        <PersonIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" gutterBottom>
                            No employees yet.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setDialogOpen(true)}
                            sx={{ mt: 1 }}
                        >
                            Add First Employee
                        </Button>
                    </Box>
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
            </Paper>

            <EmployeeDialog
                open={dialogOpen}
                onClose={handleClose}
                onSubmit={onSubmit}
                isPending={createMutation.isPending || updateMutation.isPending}
                initialData={editingEmployee}
            />
        </Stack>
    );
};
