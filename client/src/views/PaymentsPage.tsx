"use client";

import { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';

import { PageShell } from './PageShell';
import { PageHeader } from '../shared/components/PageHeader';
import { SectionCard } from '../shared/components/SectionCard';
import { PaymentForm } from '../features/payments/components/PaymentForm';
import { CustomerPaymentTable } from '../features/payments/components/CustomerPaymentTable';
import { SupplierPaymentTable } from '../features/payments/components/SupplierPaymentTable';

interface PaymentsPageProps {
    workspaceId: string;
}

import { Permission } from '../types/auth';
import { usePermission } from '../hooks/usePermission';
import { UnauthorizedView } from '../components/UnauthorizedView';

export const PaymentsPage = ({ workspaceId }: PaymentsPageProps) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [isFormOpen, setFormOpen] = useState(false);
    const { hasPermission } = usePermission();

    const canViewCustomer = hasPermission(Permission.PAYMENTS_CUSTOMER_VIEW);
    const canViewSupplier = hasPermission(Permission.PAYMENTS_SUPPLIER_VIEW);
    
    if (!canViewCustomer && !canViewSupplier) {
        return (
            <PageShell workspaceId={workspaceId}>
                <UnauthorizedView />
            </PageShell>
        );
    }

    // Keep the selected mode valid without updating state during render.
    const effectiveTabIndex = canViewCustomer ? (canViewSupplier ? tabIndex : 0) : 1;

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const activeMode = effectiveTabIndex === 0 ? 'CUSTOMER' : 'SUPPLIER';
    
    const canRecordPayment = activeMode === 'CUSTOMER' 
        ? hasPermission(Permission.PAYMENTS_CUSTOMER_RECORD)
        : hasPermission(Permission.PAYMENTS_SUPPLIER_RECORD);

    return (
        <PageShell workspaceId={workspaceId}>
            <PageHeader
                title="Payments"
                subtitle="Settle outstanding ledgers securely managing incoming and outgoing cash flows perfectly."
                action={
                    canRecordPayment ? (
                        <Button variant="contained" onClick={() => setFormOpen(true)}>
                            + {activeMode === 'CUSTOMER' ? 'Record Customer Payment' : 'Settle Supplier Payment'}
                        </Button>
                    ) : null
                }
            />

            <SectionCard title="Payment history">
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={effectiveTabIndex} onChange={handleTabChange} aria-label="payment tabs">
                        {canViewCustomer && <Tab value={0} label="Customer Payments" />}
                        {canViewSupplier && <Tab value={1} label="Supplier Payments" />}
                    </Tabs>
                </Box>

                {effectiveTabIndex === 0 && canViewCustomer && <CustomerPaymentTable workspaceId={workspaceId} />}
                {effectiveTabIndex === 1 && canViewSupplier && <SupplierPaymentTable workspaceId={workspaceId} />}
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
