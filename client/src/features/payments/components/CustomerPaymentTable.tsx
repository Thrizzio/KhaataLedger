import { useState } from 'react';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useCustomerPayments } from '../hooks/usePayments';

interface CustomerPaymentTableProps {
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

export function CustomerPaymentTable({ workspaceId }: CustomerPaymentTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading } = useCustomerPayments(workspaceId, {
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
            id: 'customer',
            label: 'Customer',
            render: (row) => row.customer?.name
        },
        {
            id: 'amount',
            label: 'Amount',
            align: 'right',
            render: (row) => (
                <Typography variant="body2" fontWeight={600} color="success.main">
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
                    title="No customer payments found."
                    description="Record a customer payment to see it here."
                />
            }
        />
    );
}
