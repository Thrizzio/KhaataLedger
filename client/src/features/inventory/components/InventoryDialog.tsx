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
import InputAdornment from '@mui/material/InputAdornment';

import { inventoryFormSchema, type InventoryFormValues } from '../validation';
import { useInventoryMutations } from '../hooks/useInventoryMutations';
import type { InventoryItem } from '../types';
import { applyApiFieldErrors } from '../../../api/apiError';

interface InventoryDialogProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    initialData?: InventoryItem | null;
    onSuccess?: (item: InventoryItem) => void;
}

export function InventoryDialog({ open, onClose, workspaceId, initialData, onSuccess }: InventoryDialogProps) {
    const isEditing = Boolean(initialData);
    const { createMutation, updateMutation } = useInventoryMutations(workspaceId);

    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm<InventoryFormValues>({
        resolver: zodResolver(inventoryFormSchema),
        defaultValues: { name: '', sku: '', unit: '', defaultSellingPrice: 0 },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    sku: initialData.sku ?? '',
                    unit: initialData.unit ?? '',
                    defaultSellingPrice: initialData.defaultSellingPrice,
                });
            } else {
                reset({ name: '', sku: '', unit: '', defaultSellingPrice: 0 });
            }
        }
    }, [open, initialData, reset]);

    const onSubmit = (data: InventoryFormValues) => {
        if (isEditing && initialData) {
            updateMutation.mutate(
                { id: initialData.id, payload: data },
                {
                    onSuccess: (res) => { if (onSuccess) onSuccess(res as unknown as InventoryItem); onClose(); },
                    onError: (error) => applyApiFieldErrors(error, (field, message) =>
                        setError(field as keyof InventoryFormValues, { type: 'server', message }),
                    ),
                }
            );
        } else {
            createMutation.mutate(
                data,
                {
                    onSuccess: (res) => { if (onSuccess) onSuccess(res as unknown as InventoryItem); onClose(); },
                    onError: (error) => applyApiFieldErrors(error, (field, message) =>
                        setError(field as keyof InventoryFormValues, { type: 'server', message }),
                    ),
                }
            );
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{isEditing ? 'Edit Item' : 'Create New Item'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Item Name *" error={!!errors.name} helperText={errors.name?.message} fullWidth />
                            )}
                        />
                        <Stack direction="row" spacing={3}>
                            <Controller
                                name="sku"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="SKU (Optional)" error={!!errors.sku} helperText={errors.sku?.message} fullWidth />
                                )}
                            />
                            <Controller
                                name="unit"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Unit (e.g. Kg, Box)" error={!!errors.unit} helperText={errors.unit?.message} fullWidth />
                                )}
                            />
                        </Stack>
                        <Controller
                            name="defaultSellingPrice"
                            control={control}
                            render={({ field: { onChange, value, ...rest } }) => (
                                <TextField
                                    {...rest}
                                    value={value === 0 ? '' : value}
                                    onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                                    type="number"
                                    label="Selling Price *"
                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                    error={!!errors.defaultSellingPrice}
                                    helperText={errors.defaultSellingPrice?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isPending}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Item'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
