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
import { CustomerTable } from '../features/customers/components/CustomerTable';
import { CustomerDialog } from '../features/customers/components/CustomerDialog';

interface CustomersPageProps {
    workspaceId: string;
}

export const CustomersPage = ({ workspaceId }: CustomersPageProps) => {
    const [searchStr, setSearchStr] = useState('');
    const [isCreateOpen, setCreateOpen] = useState(false);

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Customers"
                subtitle="Manage your business customers and track entirely unified sales ledgers."
                action={
                    <Button variant="contained" onClick={() => setCreateOpen(true)}>
                        + Create Customer
                    </Button>
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

                <CustomerTable workspaceId={workspaceId} searchStr={searchStr} />
            </SectionCard>

            <CustomerDialog
                open={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                workspaceId={workspaceId}
            />
        </PageShell>
    );
};
