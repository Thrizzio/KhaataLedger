import { useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Stack from '@mui/material/Stack';

import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useCustomers } from '../hooks/useCustomers';
import { useCustomerMutations } from '../hooks/useCustomerMutations';
import { CustomerDialog } from './CustomerDialog';
import type { Customer } from '../types';
import { Permission } from '../../../types/auth';
import { usePermission } from '../../../hooks/usePermission';

interface CustomerTableProps {
    workspaceId: string;
    searchStr: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export function CustomerTable({ workspaceId, searchStr }: CustomerTableProps) {
    const { hasPermission } = usePermission();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

    const { data, isLoading } = useCustomers(workspaceId, {
        page: page + 1,
        limit: rowsPerPage,
        search: searchStr || undefined,
        sortBy: 'name',
        order: 'asc'
    });

    const { deleteMutation } = useCustomerMutations(workspaceId);

    const handleEdit = (customer: Customer) => {
        setEditCustomer(customer);
        setEditDialogOpen(true);
    };

    const handleDelete = () => {
        if (deleteCustomer) {
            deleteMutation.mutate(deleteCustomer.id, {
                onSuccess: () => setDeleteCustomer(null)
            });
        }
    };

    const columns: ColumnDef<Customer>[] = [
        { id: 'name', label: 'Customer Name' },
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
                    {hasPermission(Permission.CUSTOMERS_VIEW) && (
                        <IconButton size="small" component={Link} href={`/workspaces/${workspaceId}/customers/${row.id}`} color="info" aria-label="view ledger">
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    )}
                    {hasPermission(Permission.CUSTOMERS_EDIT) && (
                        <IconButton size="small" onClick={() => handleEdit(row)} color="primary" aria-label="edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {hasPermission(Permission.CUSTOMERS_DELETE) && (
                        <IconButton size="small" onClick={() => setDeleteCustomer(row)} color="error" aria-label="delete">
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
                rows={data?.customers || []}
                isLoading={isLoading}
                totalElements={data?.pagination.total || 0}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
                emptyState={
                    <EmptyState
                        icon={<PeopleIcon />}
                        title={searchStr ? "No matching customers found." : "Your customer list is empty."}
                        description={searchStr ? "Adjust your search terms and try again." : "Start tracking sales by adding your first customer."}
                    />
                }
            />

            <CustomerDialog
                open={isEditDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                workspaceId={workspaceId}
                initialData={editCustomer}
            />

            <ConfirmDialog
                open={Boolean(deleteCustomer)}
                title="Delete Customer"
                content={`Are you sure you want to completely remove "${deleteCustomer?.name}"? You will lose their chronological ledger timeline.`}
                confirmText="Remove Customer"
                isDanger={true}
                isPending={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setDeleteCustomer(null)}
            />
        </>
    );
}
