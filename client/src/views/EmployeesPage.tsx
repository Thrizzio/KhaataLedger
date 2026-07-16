"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import Avatar from '@mui/material/Avatar';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { workspaceService } from '../services/workspace.service';
import type { CreateEmployeePayload, Employee } from '../types/workspace';

interface EmployeesPageProps {
    workspaceId: string;
}

export const EmployeesPage = ({ workspaceId }: EmployeesPageProps) => {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: employees, isLoading, isError } = useQuery<Employee[]>({
        queryKey: ['employees', workspaceId],
        queryFn: () =>
            workspaceService.getEmployees(workspaceId).then((r) => r.data.data ?? []),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateEmployeePayload>({
        defaultValues: { name: '', email: '', password: '' },
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateEmployeePayload) =>
            workspaceService.createEmployee(workspaceId, payload),
        onSuccess: (response) => {
            toast.success(response.data.message || 'Employee created!');
            queryClient.invalidateQueries({ queryKey: ['employees', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            setDialogOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create employee.');
        },
    });

    const onSubmit = (values: CreateEmployeePayload) => {
        createMutation.mutate(values);
    };

    const handleClose = () => {
        setDialogOpen(false);
        reset();
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
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                >
                    Add Employee
                </Button>
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
                                                <Typography fontWeight={500}>{emp.name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>
                                            <Chip label="Employee" size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(emp.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Add Employee Dialog */}
            <Dialog open={dialogOpen} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle fontWeight={700}>Add Employee</DialogTitle>
                <Divider />
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Stack spacing={2} mt={1}>
                            <TextField
                                label="Full Name"
                                fullWidth
                                {...register('name', { required: 'Name is required' })}
                                error={Boolean(errors.name)}
                                helperText={errors.name?.message}
                                disabled={createMutation.isPending}
                            />
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                {...register('email', { required: 'Email is required' })}
                                error={Boolean(errors.email)}
                                helperText={errors.email?.message}
                                disabled={createMutation.isPending}
                            />
                            <TextField
                                label="Temporary Password"
                                type="password"
                                fullWidth
                                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                error={Boolean(errors.password)}
                                helperText={errors.password?.message || 'Employee will use this to log in.'}
                                disabled={createMutation.isPending}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={handleClose} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Employee'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Stack>
    );
};
