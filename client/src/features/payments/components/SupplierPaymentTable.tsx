import { useState } from 'react';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useSupplierPayments } from '../hooks/usePayments';

interface SupplierPaymentTableProps {
    workspaceId: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

export function SupplierPaymentTable({ workspaceId }: SupplierPaymentTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, isError, refetch } = useSupplierPayments(workspaceId, {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'paymentDate',
        order: 'desc'
    });

    const columns: ColumnDef<any>[] = [
        {
            id: 'date',
            label: 'Date',
            render: (row) => (
                <Typography variant="body2">{formatDate(row.paymentDate)}</Typography>
            )
        },
        {
            id: 'supplier',
            label: 'Supplier',
            render: (row) => row.supplier?.name
        },
        {
            id: 'amount',
            label: 'Amount',
            align: 'right',
            render: (row) => (
                <Typography variant="body2" fontWeight={600} color="error.main">
                    {formatCurrency(row.amount)}
                </Typography>
            )
        },
        {
            id: 'notes',
            label: 'Notes',
            render: (row) => row.notes || '-'
        },
        {
            id: 'createdBy',
            label: 'Created By',
            render: (row) => row.createdBy?.name
        }
    ];

    if (isError) {
        return (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                Supplier payments could not be loaded. Your existing payment records are unchanged.
            </Alert>
        );
    }

    return (
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
                    icon={<AccountBalanceWalletIcon />}
                    title="No supplier payments found."
                    description="Record a supplier payment to see it here."
                />
            }
        />
    );
}
