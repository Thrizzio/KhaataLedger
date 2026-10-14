import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { customerPaymentSchema, supplierPaymentSchema, type CustomerPaymentFormValues, type SupplierPaymentFormValues } from '../validation';
import { useCreateCustomerPayment, useCreateSupplierPayment } from '../hooks/usePaymentMutations';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { useSuppliers } from '../../suppliers/hooks/useSuppliers';
import { applyApiFieldErrors } from '../../../api/apiError';

interface PaymentFormProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    type: 'CUSTOMER' | 'SUPPLIER';
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export function PaymentForm({ open, onClose, workspaceId, type }: PaymentFormProps) {
    const customerMutation = useCreateCustomerPayment(workspaceId);
    const supplierMutation = useCreateSupplierPayment(workspaceId);

    const isCustomer = type === 'CUSTOMER';
    const mutation = isCustomer ? customerMutation : supplierMutation;
    const activeSchema = isCustomer ? customerPaymentSchema : supplierPaymentSchema;

    const { data: customerData, isLoading: loadingCustomers } = useCustomers(workspaceId, { page: 1, limit: 1000, sortBy: 'name', order: 'asc' });
    const { data: supplierData, isLoading: loadingSuppliers } = useSuppliers(workspaceId, { page: 1, limit: 1000, sortBy: 'name', order: 'asc' });

    type GenericFormValues = { customerId?: string; supplierId?: string; amount: number; paymentDate: string; notes?: string; };

    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm<GenericFormValues>({
        resolver: zodResolver(activeSchema),
        defaultValues: {
            customerId: '',
            supplierId: '',
            amount: 0,
            paymentDate: new Date().toISOString().substring(0, 16),
            notes: ''
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                customerId: '',
                supplierId: '',
                amount: 0,
                paymentDate: new Date().toISOString().substring(0, 16),
                notes: ''
            });
        }
    }, [open, reset]);

    const onSubmit = (data: GenericFormValues) => {
        if (mutation.isPending) return;
        mutation.mutate(
            {
                ...(isCustomer ? { customerId: data.customerId! } : { supplierId: data.supplierId! }),
                amount: data.amount,
                paymentDate: new Date(data.paymentDate).toISOString(),
                notes: data.notes
            } as any,
            {
                onSuccess: () => onClose(),
                onError: (error) => applyApiFieldErrors(error, (field, message) =>
                    setError(field as keyof GenericFormValues, { type: 'server', message }),
                ),
            }
        );
    };

    const isPending = mutation.isPending;
    const isDataLoading = isCustomer ? loadingCustomers : loadingSuppliers;

    return (
        <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>{isCustomer ? 'Record Customer Payment' : 'Settle Supplier Payment'}</DialogTitle>
                <DialogContent dividers>

                    {isDataLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12 }}>
                                {isCustomer ? (
                                    <Controller
                                        name="customerId"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} select label="Customer *" error={!!errors.customerId} helperText={errors.customerId?.message} fullWidth>
                                                {customerData?.customers.map(c => (
                                                    <MenuItem key={c.id} value={c.id}>{c.name} (Due: {formatCurrency(c.outstandingBalance)})</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                ) : (
                                    <Controller
                                        name="supplierId"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField {...field} select label="Supplier *" error={!!errors.supplierId} helperText={errors.supplierId?.message} fullWidth>
                                                {supplierData?.items.map(s => (
                                                    <MenuItem key={s.id} value={s.id}>{s.name} (Owed: {formatCurrency(s.outstandingBalance)})</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} type="number" label="Amount *" inputProps={{ min: 0 }} error={!!errors.amount} helperText={errors.amount?.message} fullWidth />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="paymentDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} type="datetime-local" label="Date *" InputLabelProps={{ shrink: true }} error={!!errors.paymentDate} helperText={errors.paymentDate?.message} fullWidth />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    name="notes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Notes (Optional)" multiline rows={3} error={!!errors.notes} helperText={errors.notes?.message} fullWidth />
                                    )}
                                />
                            </Grid>

                        </Grid>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isPending || isDataLoading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isPending || isDataLoading}>
                        {isPending ? 'Processing...' : 'Record Payment'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
