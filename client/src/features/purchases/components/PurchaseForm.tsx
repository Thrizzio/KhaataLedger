import { useEffect } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';

import { purchaseFormSchema, type PurchaseFormValues } from '../validation';
import { useCreatePurchase } from '../hooks/useCreatePurchase';
import { useSuppliers } from '../../suppliers/hooks/useSuppliers';
import { useInventory } from '../../inventory/hooks/useInventory';

interface PurchaseFormProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export function PurchaseForm({ open, onClose, workspaceId }: PurchaseFormProps) {
    const mutation = useCreatePurchase(workspaceId);

    const { data: supplierData, isLoading: loadingSuppliers } = useSuppliers(workspaceId, { page: 1, limit: 1000, sortBy: 'name', order: 'asc' });
    const { data: inventoryData, isLoading: loadingInventory } = useInventory(workspaceId, { page: 1, limit: 1000, sortBy: 'name', order: 'asc' });

    const { control, handleSubmit, reset, formState: { errors } } = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseFormSchema),
        defaultValues: {
            supplierId: '',
            purchaseDate: new Date().toISOString().substring(0, 16),
            paymentType: 'CASH',
            items: [{ inventoryItemId: '', quantity: 1, purchasePrice: 0 }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchItems = useWatch({
        control,
        name: 'items'
    });

    const runningTotal = watchItems?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.purchasePrice) || 0), 0) || 0;

    useEffect(() => {
        if (open) {
            reset({
                supplierId: '',
                purchaseDate: new Date().toISOString().substring(0, 16),
                paymentType: 'CASH',
                items: [{ inventoryItemId: '', quantity: 1, purchasePrice: 0 }]
            });
        }
    }, [open, reset]);

    const onSubmit = (data: PurchaseFormValues) => {
        mutation.mutate(
            {
                ...data,
                purchaseDate: new Date(data.purchaseDate).toISOString()
            },
            { onSuccess: () => onClose() }
        );
    };

    const isPending = mutation.isPending;
    const isDataLoading = loadingSuppliers || loadingInventory;

    return (
        <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Record New Purchase</DialogTitle>
                <DialogContent dividers>

                    {isDataLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="supplierId"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} select label="Supplier *" error={!!errors.supplierId} helperText={errors.supplierId?.message} fullWidth>
                                            {supplierData?.items.map(s => (
                                                <MenuItem key={s.id} value={s.id}>{s.name} (Bal: {formatCurrency(s.outstandingBalance)})</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Controller
                                    name="purchaseDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} type="datetime-local" label="Date *" InputLabelProps={{ shrink: true }} error={!!errors.purchaseDate} helperText={errors.purchaseDate?.message} fullWidth />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Controller
                                    name="paymentType"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} select label="Payment via *" error={!!errors.paymentType} helperText={errors.paymentType?.message} fullWidth>
                                            <MenuItem value="CASH">Cash</MenuItem>
                                            <MenuItem value="CREDIT">Credit</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            {/* Line Items Matrix */}
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Line Items</Typography>

                                {errors.items?.root && (
                                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>{errors.items.root.message}</Typography>
                                )}

                                {fields.map((field, index) => (
                                    <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Controller
                                                name={`items.${index}.inventoryItemId`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField {...field} select label="Product" error={!!errors.items?.[index]?.inventoryItemId} helperText={errors.items?.[index]?.inventoryItemId?.message} fullWidth>
                                                        {inventoryData?.items.map(inv => (
                                                            <MenuItem key={inv.id} value={inv.id}>{inv.name} (Stock: {inv.currentStock})</MenuItem>
                                                        ))}
                                                    </TextField>
                                                )}
                                            />
                                        </Box>
                                        <Box sx={{ width: 140 }}>
                                            <Controller
                                                name={`items.${index}.quantity`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField {...field} type="number" label="Qty" inputProps={{ min: 1 }} error={!!errors.items?.[index]?.quantity} helperText={errors.items?.[index]?.quantity?.message} fullWidth />
                                                )}
                                            />
                                        </Box>
                                        <Box sx={{ width: 160 }}>
                                            <Controller
                                                name={`items.${index}.purchasePrice`}
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField {...field} type="number" label="Price (Each)" inputProps={{ min: 0 }} error={!!errors.items?.[index]?.purchasePrice} helperText={errors.items?.[index]?.purchasePrice?.message} fullWidth />
                                                )}
                                            />
                                        </Box>
                                        <Box sx={{ width: 120, pt: 2, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {formatCurrency((watchItems[index]?.quantity || 0) * (watchItems[index]?.purchasePrice || 0))}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ pt: 1 }}>
                                            <IconButton color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}

                                <Button startIcon={<AddCircleOutlineIcon />} onClick={() => append({ inventoryItemId: '', quantity: 1, purchasePrice: 0 })} sx={{ mt: 1 }}>
                                    Add Line Item
                                </Button>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Typography variant="h6">Total Purchase Amount</Typography>
                                    <Typography variant="h4" color="primary.main">{formatCurrency(runningTotal)}</Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isPending || isDataLoading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isPending || isDataLoading}>
                        {isPending ? 'Processing...' : 'Confirm Purchase'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
