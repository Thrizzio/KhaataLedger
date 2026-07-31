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
import { PaymentForm } from '../features/payments/components/PaymentForm';
import { CustomerPaymentTable } from '../features/payments/components/CustomerPaymentTable';
import { SupplierPaymentTable } from '../features/payments/components/SupplierPaymentTable';

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

                {tabIndex === 0 && <CustomerPaymentTable workspaceId={workspaceId} />}
                {tabIndex === 1 && <SupplierPaymentTable workspaceId={workspaceId} />}
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
