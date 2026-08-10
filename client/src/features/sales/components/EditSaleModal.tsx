import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import { z } from 'zod';

import { useUpdateSale } from '../hooks/useUpdateSale';
import { useInventory } from '../../inventory/hooks/useInventory';
import type { Sale } from '../types';

interface EditSaleModalProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    sale: Sale | null;
}

const updateSaleSchema = z.object({
    saleDate: z.string().min(1, 'Sale Date is required'),
    items: z.array(
        z.object({
            inventoryItemId: z.string().uuid('inventoryItemId must be a valid UUID'),
            quantity: z.coerce.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1'),
            sellingPrice: z.coerce.number().min(0, 'Selling price cannot be negative'),
        })
    ).min(1, 'At least one item is required')
    .refine(
        (items) => new Set(items.map((i) => i.inventoryItemId)).size === items.length,
        { message: 'Duplicate inventoryItemId: combine quantities into one line' },
    ),
});

type UpdateSaleFormValues = z.infer<typeof updateSaleSchema>;

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export function EditSaleModal({ open, onClose, workspaceId, sale }: EditSaleModalProps) {
    const mutation = useUpdateSale(workspaceId);
    const { data: inventoryData, isLoading: loadingInventory } = useInventory(workspaceId, { page: 1, limit: 1000, sortBy: 'name', order: 'asc' });

    const { control, handleSubmit, reset, formState: { errors } } = useForm<UpdateSaleFormValues>({
        resolver: zodResolver(updateSaleSchema),
        defaultValues: {
            saleDate: '',
            items: []
        }
    });

    useEffect(() => {
        if (open && sale) {
            reset({
                saleDate: new Date(sale.saleDate).toISOString().substring(0, 16),
                items: sale.lineItems?.map(item => ({
                    inventoryItemId: item.inventoryItemId,
                    quantity: item.quantity,
                    sellingPrice: Number(item.sellingPrice)
                })) || []
            });
        }
    }, [open, sale, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchItems = useWatch({ control, name: 'items' });

    const stockMap = useMemo(() => {
        const map: Record<string, number> = {};
        if (inventoryData?.items) {
            inventoryData.items.forEach(i => map[i.id] = i.currentStock);
        }
        return map;
    }, [inventoryData]);
    
    const oldQtyMap = useMemo(() => {
        const map: Record<string, number> = {};
        if (sale?.lineItems) {
            sale.lineItems.forEach(i => map[i.inventoryItemId] = i.quantity);
        }
        return map;
    }, [sale]);

    const runningTotal = watchItems?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.sellingPrice) || 0), 0) || 0;

    const onSubmit = (data: UpdateSaleFormValues) => {
        if (!sale) return;
        
        for (const item of data.items) {
            const avail = (stockMap[item.inventoryItemId] || 0) + (oldQtyMap[item.inventoryItemId] || 0);
            if (item.quantity > avail) {
                return;
            }
        }

        mutation.mutate(
            {
                saleId: sale.id,
                payload: {
                    saleDate: new Date(data.saleDate).toISOString(),
                    items: data.items
                }
            },
            { onSuccess: () => onClose() }
        );
    };

    const isPending = mutation.isPending;

    if (!sale) return null;

    return (
        <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Edit Sale</DialogTitle>
                <DialogContent dividers>
                    {loadingInventory ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Controller
                                    name="saleDate"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField {...field} type="datetime-local" label="Date *" InputLabelProps={{ shrink: true }} error={!!errors.saleDate} helperText={errors.saleDate?.message} fullWidth />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Box display="flex" flexDirection="column" gap={0.5}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Customer:</strong> {sale.customer?.name || 'Walk-in'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Payment Type:</strong> {sale.paymentType}
                                    </Typography>
                                    <Typography variant="caption" color="error">
                                        (Customer and Payment Type cannot be changed during an edit)
                                    </Typography>
                                </Box>
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
                                    const oldQty = selectedId ? (oldQtyMap[selectedId] || 0) : 0;
                                    const available = selectedStock !== null ? selectedStock + oldQty : null;
                                    const qty = Number(watchItems[index]?.quantity || 0);
                                    const isOverselling = available !== null && qty > available;

                                    return (
                                        <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Controller
                                                    name={`items.${index}.inventoryItemId`}
                                                    control={control}
                                                    render={({ field: { onChange, value } }) => (
                                                        <Autocomplete
                                                            fullWidth
                                                            options={inventoryData?.items || []}
                                                            getOptionLabel={(option) => `${option.name} (Available: ${(option.currentStock) + (oldQtyMap[option.id] || 0)})`}
                                                            value={inventoryData?.items.find(i => i.id === value) || null}
                                                            onChange={(_, newValue) => {
                                                                onChange(newValue?.id || '');
                                                            }}
                                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Product"
                                                                    error={!!errors.items?.[index]?.inventoryItemId}
                                                                    helperText={errors.items?.[index]?.inventoryItemId?.message}
                                                                />
                                                            )}
                                                        />
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
                                                            inputProps={{ min: 1, max: available || undefined }}
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
                    <Button onClick={onClose} color="inherit" disabled={isPending || loadingInventory}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || loadingInventory || watchItems?.some((i) => i.inventoryItemId && (i.quantity > ((stockMap[i.inventoryItemId] || 0) + (oldQtyMap[i.inventoryItemId] || 0))))}
                    >
                        {isPending ? 'Processing...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
