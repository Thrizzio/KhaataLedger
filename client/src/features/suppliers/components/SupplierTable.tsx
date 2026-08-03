import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Stack from '@mui/material/Stack';

import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useSuppliers } from '../hooks/useSuppliers';
import { useSupplierMutations } from '../hooks/useSupplierMutations';
import { SupplierDialog } from './SupplierDialog';
import type { Supplier } from '../types';
import { Permission } from '../../../types/auth';
import { usePermission } from '../../../hooks/usePermission';

interface SupplierTableProps {
    workspaceId: string;
    searchStr: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export function SupplierTable({ workspaceId, searchStr }: SupplierTableProps) {
    const { hasPermission } = usePermission();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);

    const { data, isLoading } = useSuppliers(workspaceId, {
        page: page + 1,
        limit: rowsPerPage,
        search: searchStr || undefined,
        sortBy: 'name',
        order: 'asc'
    });

    const { deleteMutation } = useSupplierMutations(workspaceId);

    const handleEdit = (supplier: Supplier) => {
        setEditSupplier(supplier);
        setEditDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteSupplier) {
            deleteMutation.mutate(deleteSupplier.id, {
                onSuccess: () => setDeleteSupplier(null)
            });
        }
    };

    const columns: ColumnDef<Supplier>[] = [
        { id: 'name', label: 'Supplier Name' },
        { id: 'phoneNumber', label: 'Phone', render: (row) => row.phoneNumber || <Box color="text.disabled">-</Box> },
        { id: 'email', label: 'Email', render: (row) => row.email || <Box color="text.disabled">-</Box> },
        {
            id: 'outstandingBalance',
            label: 'Outstanding Balance',
            align: 'right',
            render: (row) => (
                <Box color={row.outstandingBalance > 0 ? 'error.main' : 'success.main'} fontWeight={500}>
                    {formatCurrency(row.outstandingBalance)}
                </Box>
            )
        },
        {
            id: 'actions', label: 'Actions', align: 'right', render: (row) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    {hasPermission(Permission.SUPPLIERS_VIEW) && (
                        <IconButton size="small" component={Link} href={`/workspaces/${workspaceId}/suppliers/${row.id}`} color="info" aria-label="view ledger">
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    )}
                    {hasPermission(Permission.SUPPLIERS_EDIT) && (
                        <IconButton size="small" onClick={() => handleEdit(row)} color="primary" aria-label="edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {hasPermission(Permission.SUPPLIERS_DELETE) && (
                        <IconButton size="small" onClick={() => setDeleteSupplier(row)} color="error" aria-label="delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            )
        },
    ];

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
                        icon={<LocalShippingIcon />}
                        title={searchStr ? "No matching suppliers found." : "Your supplier list is empty."}
                        description={searchStr ? "Adjust your search terms and try again." : "Start tracking purchases by adding your first supplier."}
                    />
                }
            />

            <SupplierDialog
                open={isEditDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                workspaceId={workspaceId}
                initialData={editSupplier}
            />

            <ConfirmDialog
                open={Boolean(deleteSupplier)}
                title="Delete Supplier"
                content={`Are you sure you want to completely remove "${deleteSupplier?.name}"? You will lose their chronological ledger timeline.`}
                confirmText="Remove Supplier"
                isDanger={true}
                isPending={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setDeleteSupplier(null)}
            />
        </>
    );
}
