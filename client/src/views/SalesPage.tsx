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
import { SaleTable } from '../features/sales/components/SaleTable';
import { SaleForm } from '../features/sales/components/SaleForm';

interface SalesPageProps {
    workspaceId: string;
}

export const SalesPage = ({ workspaceId }: SalesPageProps) => {
    const [searchStr, setSearchStr] = useState('');
    const [isCreateOpen, setCreateOpen] = useState(false);

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Sales"
                subtitle="Record outbound sales against inventory instantly updating customer ledgers and daily aggregates."
                action={
                    <Button variant="contained" onClick={() => setCreateOpen(true)}>
                        + Record Sale
                    </Button>
                }
            />

            <SectionCard>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search sales..."
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

                <SaleTable workspaceId={workspaceId} searchStr={searchStr} />
            </SectionCard>

            <SaleForm
                open={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                workspaceId={workspaceId}
            />
        </PageShell>
    );
};
