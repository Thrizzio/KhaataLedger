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

import { supplierFormSchema, type SupplierFormValues } from '../validation';
import { useSupplierMutations } from '../hooks/useSupplierMutations';
import type { Supplier } from '../types';
import { applyApiFieldErrors } from '../../../api/apiError';

interface SupplierDialogProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    initialData?: Supplier | null;
    onSuccess?: (supplier: Supplier) => void;
}

export function SupplierDialog({ open, onClose, workspaceId, initialData, onSuccess }: SupplierDialogProps) {
    const isEditing = Boolean(initialData);
    const { createMutation, updateMutation } = useSupplierMutations(workspaceId);

    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierFormSchema),
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

    const onSubmit = (data: SupplierFormValues) => {
        if (isEditing && initialData) {
            updateMutation.mutate(
                { id: initialData.id, payload: data },
                {
                    onSuccess: (res) => { if (onSuccess) onSuccess(res as unknown as Supplier); onClose(); },
                    onError: (error) => applyApiFieldErrors(error, (field, message) =>
                        setError(field as keyof SupplierFormValues, { type: 'server', message }),
                    ),
                }
            );
        } else {
            createMutation.mutate(
                data,
                {
                    onSuccess: (res) => { if (onSuccess) onSuccess(res as unknown as Supplier); onClose(); },
                    onError: (error) => applyApiFieldErrors(error, (field, message) =>
                        setError(field as keyof SupplierFormValues, { type: 'server', message }),
                    ),
                }
            );
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{isEditing ? 'Edit Supplier' : 'Create New Supplier'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Supplier Name *" error={!!errors.name} helperText={errors.name?.message} fullWidth />
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
                        {isPending ? 'Saving...' : 'Save Supplier'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
