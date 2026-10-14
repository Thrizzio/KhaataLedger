import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useInventory } from '../hooks/useInventory';
import { useInventoryMutations } from '../hooks/useInventoryMutations';
import { InventoryDialog } from './InventoryDialog';
import type { InventoryItem } from '../types';
import { Permission } from '../../../types/auth';
import { usePermission } from '../../../hooks/usePermission';

interface InventoryTableProps {
    workspaceId: string;
    searchStr: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export function InventoryTable({ workspaceId, searchStr }: InventoryTableProps) {
    const { hasPermission } = usePermission();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);

    const { data, isLoading, isError, refetch } = useInventory(workspaceId, {
        page: page + 1, // backend is 1-indexed, MUI is 0-indexed
        limit: rowsPerPage,
        search: searchStr || undefined,
        sortBy: 'name',
        order: 'asc'
    });

    const { deleteMutation } = useInventoryMutations(workspaceId);

    const handleEdit = (item: InventoryItem) => {
        setEditItem(item);
        setEditDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteItem) {
            deleteMutation.mutate(deleteItem.id, {
                onSuccess: () => setDeleteItem(null)
            });
        }
    };

    const columns: ColumnDef<InventoryItem>[] = [
        { id: 'name', label: 'Item Name' },
        { id: 'sku', label: 'SKU', render: (row) => row.sku || <Box color="text.disabled">-</Box> },
        {
            id: 'currentStock',
            label: 'Stock',
            render: (row) => (
                <Box display="flex" alignItems="center" gap={1}>
                    {row.currentStock} {row.unit}
                    {row.currentStock <= row.minStockLevel && <WarningAmberIcon color="warning" fontSize="small" />}
                </Box>
            )
        },
        { id: 'defaultPurchasePrice', label: 'Purchase Price', render: (row) => row.defaultPurchasePrice !== null ? formatCurrency(row.defaultPurchasePrice) : '-' },
        { id: 'defaultSellingPrice', label: 'Selling Price', render: (row) => formatCurrency(row.defaultSellingPrice) },
        {
            id: 'actions', label: 'Actions', align: 'right', render: (row) => (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    {hasPermission(Permission.INVENTORY_EDIT) && (
                        <IconButton size="small" onClick={() => handleEdit(row)} color="primary" aria-label={`Edit ${row.name}`}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {hasPermission(Permission.INVENTORY_DELETE) && (
                        <IconButton size="small" onClick={() => setDeleteItem(row)} color="error" aria-label={`Delete ${row.name}`}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>
            )
        },
    ];

    if (isError) {
        return (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                Inventory could not be loaded. Your existing items are unchanged.
            </Alert>
        );
    }

    return (
        <>
            <DataTable
                columns={columns}
                rows={data?.items || []}
                isLoading={isLoading}
                totalElements={data?.pagination.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                emptyState={
                    <EmptyState
                        icon={<Inventory2Icon />}
                        title={searchStr ? "No matching items found." : "Your inventory is empty."}
                        description={searchStr ? "Adjust your search terms and try again." : "Start managing your business stock by creating new items."}
                    />
                }
            />

            {/* Edit Form Dialog */}
            <InventoryDialog
                open={isEditDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                workspaceId={workspaceId}
                initialData={editItem}
            />

            {/* Delete Confirm Dialog */}
            <ConfirmDialog
                open={Boolean(deleteItem)}
                title="Delete Inventory Item"
                content={`Are you sure you want to completely remove "${deleteItem?.name}" from your catalog? This cannot be undone.`}
                confirmText="Remove Item"
                isDanger={true}
                isPending={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setDeleteItem(null)}
            />
        </>
    );
}
