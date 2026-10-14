import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { EmptyState } from '../../../shared/components/EmptyState';
import { usePurchases } from '../hooks/usePurchases';
import type { Purchase } from '../types';

interface PurchaseTableProps {
    workspaceId: string;
    searchStr: string;
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

export function PurchaseTable({ workspaceId, searchStr }: PurchaseTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading, isError, refetch } = usePurchases(workspaceId, {
        page: page + 1,
        limit: rowsPerPage,
        search: searchStr || undefined,
        sortBy: 'purchaseDate',
        order: 'desc'
    });

    const columns: ColumnDef<Purchase>[] = [
        {
            id: 'date',
            label: 'Date',
            render: (row) => (
                <Typography variant="body2">{formatDate(row.purchaseDate)}</Typography>
            )
        },
        {
            id: 'supplier',
            label: 'Supplier',
            render: (row) => row.supplier?.name || <Box color="text.disabled">Unknown</Box>
        },
        {
            id: 'itemsCount',
            label: 'Line Items',
            render: (row) => (
                <Typography variant="body2">{row.lineItems?.length || 0} items</Typography>
            )
        },
        {
            id: 'paymentType',
            label: 'Payment',
            render: (row) => (
                <Chip
                    label={row.paymentType}
                    size="small"
                    color={row.paymentType === 'CASH' ? 'success' : 'warning'}
                    variant="outlined"
                />
            )
        },
        {
            id: 'totalAmount',
            label: 'Total Amount',
            align: 'right',
            render: (row) => (
                <Typography variant="body2" fontWeight={600} color="error.main">
                    {formatCurrency(row.totalAmount)}
                </Typography>
            )
        }
    ];

    if (isError) {
        return (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                Purchases could not be loaded. Your existing purchase records are unchanged.
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
                    icon={<ReceiptIcon />}
                    title={searchStr ? "No matching purchases found." : "No purchases recorded."}
                    description={searchStr ? "Adjust your search terms." : "Record your first inventory purchase from a supplier."}
                />
            }
        />
    );
}
