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
import { SupplierTable } from '../features/suppliers/components/SupplierTable';
import { SupplierDialog } from '../features/suppliers/components/SupplierDialog';

interface SuppliersPageProps {
    workspaceId: string;
}

import { Permission } from '../types/auth';
import { usePermission } from '../hooks/usePermission';
import { UnauthorizedView } from '../components/UnauthorizedView';

export const SuppliersPage = ({ workspaceId }: SuppliersPageProps) => {
    const [searchStr, setSearchStr] = useState('');
    const [isCreateOpen, setCreateOpen] = useState(false);
    const { hasPermission } = usePermission();

    if (!hasPermission(Permission.SUPPLIERS_VIEW)) {
        return (
            <PageShell workspaceId={workspaceId}>
                <UnauthorizedView />
            </PageShell>
        );
    }

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Suppliers"
                subtitle="Manage your vendors, view purchase histories, and track accounts payable."
                action={
                    hasPermission(Permission.SUPPLIERS_CREATE) ? (
                        <Button variant="contained" onClick={() => setCreateOpen(true)}>
                            + Create Supplier
                        </Button>
                    ) : null
                }
            />

            <SectionCard>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search name, phone, or email..."
                        value={searchStr}
                        onChange={(e) => setSearchStr(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            )
                        }}
                        sx={{ width: { xs: '100%', sm: 320 } }}
                    />
                </Box>

                <SupplierTable workspaceId={workspaceId} searchStr={searchStr} />
            </SectionCard>

            <SupplierDialog
                open={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                workspaceId={workspaceId}
            />
        </PageShell>
    );
};
