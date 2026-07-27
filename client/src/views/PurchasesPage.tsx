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
import { PurchaseTable } from '../features/purchases/components/PurchaseTable';
import { PurchaseForm } from '../features/purchases/components/PurchaseForm';

interface PurchasesPageProps {
    workspaceId: string;
}

export const PurchasesPage = ({ workspaceId }: PurchasesPageProps) => {
    const [searchStr, setSearchStr] = useState('');
    const [isCreateOpen, setCreateOpen] = useState(false);

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Purchases"
                subtitle="Record inventory intake from suppliers automatically updating stocks and accounting balances."
                action={
                    <Button variant="contained" onClick={() => setCreateOpen(true)}>
                        + Record Purchase
                    </Button>
                }
            />

            <SectionCard>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search purchases..."
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

                <PurchaseTable workspaceId={workspaceId} searchStr={searchStr} />
            </SectionCard>

            <PurchaseForm
                open={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                workspaceId={workspaceId}
            />
        </PageShell>
    );
};
