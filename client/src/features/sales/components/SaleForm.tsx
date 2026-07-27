import { useEffect, useState, useMemo } from 'react';
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

import { saleFormSchema, type SaleFormValues } from '../validation';
import { useCreateSale } from '../hooks/useCreateSale';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { useInventory } from '../../inventory/hooks/useInventory';

interface SaleFormProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export function SaleForm({ open, onClose, workspaceId }: SaleFormProps) {
    const mutation = useCreateSale(workspaceId);

    const { data: customerData, isLoading: loadingCustomers } = useCustomers(workspaceId, { page: 1, limit: 1000, sortBy: 'name', order: 'asc' });
    const { data: inventoryData, isLoading: loadingInventory } = useInventory(workspaceId, { page: 1, limit: 1000, sortBy: 'name', order: 'asc' });

    const { control, handleSubmit, reset, formState: { errors } } = useForm<SaleFormValues>({
        resolver: zodResolver(saleFormSchema),
        defaultValues: {
            customerId: '',
            saleDate: new Date().toISOString().substring(0, 16),
            paymentType: 'CASH',
            items: [{ inventoryItemId: '', quantity: 1, sellingPrice: 0 }]
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchItems = useWatch({ control, name: 'items' });
    const watchPaymentType = useWatch({ control, name: 'paymentType' });

    // Expose current stock availability dictionary mapped from Tanstack fetch
    const stockMap = useMemo(() => {
        const map: Record<string, number> = {};
        if (inventoryData?.items) {
            inventoryData.items.forEach(i => map[i.id] = i.currentStock);
        }
        return map;
    }, [inventoryData]);

    const runningTotal = watchItems?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.sellingPrice) || 0), 0) || 0;

    useEffect(() => {
        if (open) {
            reset({
                customerId: '',
                saleDate: new Date().toISOString().substring(0, 16),
                paymentType: 'CASH',
                items: [{ inventoryItemId: '', quantity: 1, sellingPrice: 0 }]
            });
        }
    }, [open, reset]);

    const onSubmit = (data: SaleFormValues) => {
        // Custom guard guaranteeing quantities do not exceed stock 
        // (Backend will throw anyway, but blocking explicitly here optimizes UX)
        for (const item of data.items) {
            const avail = stockMap[item.inventoryItemId] || 0;
            if (item.quantity > avail) {
                return; // Prevent execution, validation visuals are mapped natively inside Textfield bounds below
            }
        }

        mutation.mutate(
            {
                ...data,
                customerId: data.customerId || undefined,
                saleDate: new Date(data.saleDate).toISOString()
            },
            { onSuccess: () => onClose() }
        );
    };

    const isPending = mutation.isPending;
    const isDataLoading = loadingCustomers || loadingInventory;

    return (
        <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Record New Sale</DialogTitle>
                <DialogContent dividers>

                    {isDataLoading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="customerId"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            label={watchPaymentType === 'CREDIT' ? 'Customer *' : 'Customer (Optional)'}
                                            error={!!errors.customerId}
                                            helperText={errors.customerId?.message}
                                            fullWidth
                                        >
                                            <MenuItem value=""><em>None (Walk-in)</em></MenuItem>
                                            {customerData?.customers.map(c => (
                                                <MenuItem key={c.id} value={c.id}>{c.name} (Bal: {formatCurrency(c.outstandingBalance)})</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Controller
                                    name="saleDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} type="datetime-local" label="Date *" InputLabelProps={{ shrink: true }} error={!!errors.saleDate} helperText={errors.saleDate?.message} fullWidth />
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

                                {fields.map((field, index) => {
                                    const selectedId = watchItems[index]?.inventoryItemId;
                                    const selectedStock = selectedId ? stockMap[selectedId] : null;
                                    const qty = Number(watchItems[index]?.quantity || 0);
                                    const isOverselling = selectedStock !== null && qty > selectedStock;

                                    return (
                                        <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Controller
                                                    name={`items.${index}.inventoryItemId`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            select
                                                            label="Product"
                                                            error={!!errors.items?.[index]?.inventoryItemId}
                                                            helperText={errors.items?.[index]?.inventoryItemId?.message}
                                                            fullWidth
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                // optionally auto-fill price here if required? backend doesn't mandate front-end injection for sellingPrice matching, but we'll leave manual entry default for flexibility
                                                            }}
                                                        >
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
                                                        <TextField
                                                            {...field}
                                                            type="number"
                                                            label="Qty"
                                                            inputProps={{ min: 1, max: selectedStock || undefined }}
                                                            error={!!errors.items?.[index]?.quantity || isOverselling}
                                                            helperText={isOverselling ? 'Exceeds stock' : errors.items?.[index]?.quantity?.message}
                                                            fullWidth
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            <Box sx={{ width: 160 }}>
                                                <Controller
                                                    name={`items.${index}.sellingPrice`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField {...field} type="number" label="Price (Each)" inputProps={{ min: 0 }} error={!!errors.items?.[index]?.sellingPrice} helperText={errors.items?.[index]?.sellingPrice?.message} fullWidth />
                                                    )}
                                                />
                                            </Box>
                                            <Box sx={{ width: 120, pt: 2, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {formatCurrency((watchItems[index]?.quantity || 0) * (watchItems[index]?.sellingPrice || 0))}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ pt: 1 }}>
                                                <IconButton color="error" onClick={() => remove(index)} disabled={fields.length === 1}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )
                                })}

                                <Button startIcon={<AddCircleOutlineIcon />} onClick={() => append({ inventoryItemId: '', quantity: 1, sellingPrice: 0 })} sx={{ mt: 1 }}>
                                    Add Line Item
                                </Button>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Typography variant="h6">Total Sale Amount</Typography>
                                    <Typography variant="h4" color="primary.main">{formatCurrency(runningTotal)}</Typography>
                                </Box>
                            </Grid>

                        </Grid>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isPending || isDataLoading}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || isDataLoading || watchItems?.some((i) => i.inventoryItemId && (i.quantity > (stockMap[i.inventoryItemId] || 0)))}
                    >
                        {isPending ? 'Processing...' : 'Confirm Sale'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
