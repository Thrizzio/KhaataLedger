"use client";

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';

import { PageShell } from './PageShell';
import { PageHeader } from '../shared/components/PageHeader';
import { SectionCard } from '../shared/components/SectionCard';
import { InventoryTable } from '../features/inventory/components/InventoryTable';
import { InventoryDialog } from '../features/inventory/components/InventoryDialog';

interface InventoryPageProps {
    workspaceId: string;
}

import { Permission } from '../types/auth';
import { usePermission } from '../hooks/usePermission';
import { UnauthorizedView } from '../components/UnauthorizedView';

export const InventoryPage = ({ workspaceId }: InventoryPageProps) => {
    const [searchStr, setSearchStr] = useState('');
    const [isCreateOpen, setCreateOpen] = useState(false);
    const { hasPermission } = usePermission();

    if (!hasPermission(Permission.INVENTORY_VIEW)) {
        return (
            <PageShell workspaceId={workspaceId}>
                <UnauthorizedView />
            </PageShell>
        );
    }

    return (
        <PageShell workspaceId={workspaceId}>
            {/* ── Page Header ─────────────────────────────────── */}
            <PageHeader
                title="Inventory"
                subtitle="Manage your business stock, pricing, and view item analytics."
                action={
                    hasPermission(Permission.INVENTORY_CREATE) ? (
                        <Button variant="contained" onClick={() => setCreateOpen(true)}>
                            + Create Item
                        </Button>
                    ) : null
                }
            />

            {/* ── Table & Filtration ──────────────────────────── */}
            <SectionCard>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or SKU..."
                        value={searchStr}
                        onChange={(e) => setSearchStr(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        sx={{ width: { xs: '100%', sm: 300 } }}
                    />
                </Box>

                <InventoryTable workspaceId={workspaceId} searchStr={searchStr} />
            </SectionCard>

            {/* ── Create Form Hook Mount ──────────────────────── */}
            <InventoryDialog
                open={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                workspaceId={workspaceId}
            />
        </PageShell>
    );
};
