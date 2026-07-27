"use client";

import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { PageShell } from './PageShell';
import { PageHeader } from '../shared/components/PageHeader';
import { SectionCard } from '../shared/components/SectionCard';
import { EmptyState } from '../shared/components/EmptyState';
import { PaymentForm } from '../features/payments/components/PaymentForm';

interface PaymentsPageProps {
    workspaceId: string;
}

export const PaymentsPage = ({ workspaceId }: PaymentsPageProps) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [isFormOpen, setFormOpen] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const activeMode = tabIndex === 0 ? 'CUSTOMER' : 'SUPPLIER';

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Payments"
                subtitle="Settle outstanding ledgers securely managing incoming and outgoing cash flows perfectly."
                action={
                    <Button variant="contained" onClick={() => setFormOpen(true)}>
                        + {activeMode === 'CUSTOMER' ? 'Record Customer Payment' : 'Settle Supplier Payment'}
                    </Button>
                }
            />

            <SectionCard>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="payment tabs">
                        <Tab label="Customer Payments" />
                        <Tab label="Supplier Payments" />
                    </Tabs>
                </Box>

                <EmptyState
                    icon={<AccountBalanceWalletIcon />}
                    title="Read Functionality Restricted"
                    description="The centralized REST API restricts historical payment queries at this endpoint natively. Payments are automatically parsed instantly back down into the detailed Profile Ledgers sequentially exactly as deployed across the Khata logic constraints."
                />
            </SectionCard>

            <PaymentForm
                open={isFormOpen}
                onClose={() => setFormOpen(false)}
                workspaceId={workspaceId}
                type={activeMode}
            />
        </PageShell>
    );
};
