import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

import { customerFormSchema, type CustomerFormValues } from '../validation';
import { useCustomerMutations } from '../hooks/useCustomerMutations';
import type { Customer } from '../types';

interface CustomerDialogProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    initialData?: Customer | null;
}

export function CustomerDialog({ open, onClose, workspaceId, initialData }: CustomerDialogProps) {
    const isEditing = Boolean(initialData);
    const { createMutation, updateMutation } = useCustomerMutations(workspaceId);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
        defaultValues: { name: '', phoneNumber: '', email: '', address: '' },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    phoneNumber: initialData.phoneNumber ?? '',
                    email: initialData.email ?? '',
                    address: initialData.address ?? '',
                });
            } else {
                reset({ name: '', phoneNumber: '', email: '', address: '' });
            }
        }
    }, [open, initialData, reset]);

    const onSubmit = (data: CustomerFormValues) => {
        if (isEditing && initialData) {
            updateMutation.mutate(
                { id: initialData.id, payload: data },
                { onSuccess: () => onClose() }
            );
        } else {
            createMutation.mutate(
                data,
                { onSuccess: () => onClose() }
            );
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{isEditing ? 'Edit Customer' : 'Create New Customer'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Full Name *" error={!!errors.name} helperText={errors.name?.message} fullWidth />
                            )}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                            <Controller
                                name="phoneNumber"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Phone Number" error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} fullWidth />
                                )}
                            />
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} type="email" label="Email Address" error={!!errors.email} helperText={errors.email?.message} fullWidth />
                                )}
                            />
                        </Stack>
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Billing Address" multiline rows={2} error={!!errors.address} helperText={errors.address?.message} fullWidth />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isPending}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Customer'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
