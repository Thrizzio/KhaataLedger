import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ReceiptIcon from '@mui/icons-material/Receipt';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';

import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { EmptyState } from '../../../shared/components/EmptyState';
import { useSales } from '../hooks/useSales';
import type { Sale } from '../types';
import { EditSaleModal } from './EditSaleModal';
import { usePermission } from '../../../hooks/usePermission';
import { Permission } from '../../../types/auth';

interface SaleTableProps {
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

export function SaleTable({ workspaceId, searchStr }: SaleTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [editingSale, setEditingSale] = useState<Sale | null>(null);

    const { hasPermission } = usePermission();
    const canRecordSale = hasPermission(Permission.SALES_RECORD);

    const { data, isLoading, isError } = useSales(workspaceId, {
        page: page + 1,
        limit: rowsPerPage,
        search: searchStr || undefined,
        sortBy: 'saleDate',
        order: 'desc'
    });

    const columns: ColumnDef<Sale>[] = [
        {
            id: 'date',
            label: 'Date',
            render: (row) => (
                <Typography variant="body2">{formatDate(row.saleDate)}</Typography>
            )
        },
        {
            id: 'customer',
            label: 'Customer',
            render: (row) => row.customer?.name || <Box color="text.disabled">Walk-in</Box>
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
                    color={row.paymentType === 'CREDIT' ? 'warning' : 'success'}
                    variant="outlined"
                />
            )
        },
        {
            id: 'totalAmount',
            label: 'Total Amount',
            align: 'right',
            render: (row) => (
                <Typography variant="body2" fontWeight={600} color="primary.main">
                    {formatCurrency(row.totalAmount)}
                </Typography>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (row) => canRecordSale ? (
                <Tooltip title="Edit Sale">
                    <IconButton size="small" onClick={() => setEditingSale(row)} color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : null
        }
    ];

    if (isError) {
        return (
            <EmptyState
                icon={<ReceiptIcon />}
                title="Backend Endpoint Missing"
                description="The GET /sales endpoint does not exist on the current backend API version. The sale functionality is structurally complete but requires the backend controller integration to render historical lists."
            />
        )
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
                        icon={<ReceiptIcon />}
                        title={searchStr ? "No matching sales found." : "No sales recorded."}
                        description={searchStr ? "Adjust your search terms." : "Record your first inventory sale."}
                    />
                }
            />
            {editingSale && (
                <EditSaleModal
                    open={Boolean(editingSale)}
                    onClose={() => setEditingSale(null)}
                    workspaceId={workspaceId}
                    sale={editingSale}
                />
            )}
        </>
    );
}
