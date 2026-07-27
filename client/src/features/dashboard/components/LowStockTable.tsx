import Inventory2Icon from '@mui/icons-material/Inventory2';
import Button from '@mui/material/Button';
import { useLowStock } from '../hooks/useLowStock';
import { DataTable, type ColumnDef } from '../../../shared/components/DataTable';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/components/EmptyState';
import type { LowStockItem } from '../types';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const columns: ColumnDef<LowStockItem>[] = [
    { id: 'name', label: 'Item Name' },
    { id: 'sku', label: 'SKU' },
    { id: 'currentStock', label: 'Current Stock', align: 'center' },
    { id: 'purchasePrice', label: 'Avg Purchase Price', align: 'right', render: (row) => formatCurrency(row.purchasePrice) },
    {
        id: 'actions', label: 'Actions', align: 'right', render: () => (
            <Button size="small" disabled>Restock</Button>
        )
    },
];

export function LowStockTable({ workspaceId }: { workspaceId: string }) {
    const { data = [], isLoading, isError } = useLowStock(workspaceId);

    if (isError) {
        return (
            <SectionCard title="Low Stock Items">
                <EmptyState
                    icon={<Inventory2Icon />}
                    title="Could not load inventory"
                    description="There was a problem fetching the low stock items."
                />
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Low Stock Items">
            <DataTable
                columns={columns}
                rows={data}
                isLoading={isLoading}
                totalElements={data.length}
                page={0}
                rowsPerPage={data.length > 5 ? data.length : 5}
                onPageChange={() => { }}
                emptyState={
                    <EmptyState
                        icon={<Inventory2Icon />}
                        title="Inventory levels look healthy."
                        description="All your traceable goods are above minimum stock thresholds."
                    />
                }
            />
        </SectionCard>
    );
}
