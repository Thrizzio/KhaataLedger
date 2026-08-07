'use client';

import { useState } from 'react';
import { Box, Typography, Grid, Skeleton, Alert } from '@mui/material';
import { useReports } from './hooks/useReports';
import { ReportPeriodSelector } from './components/ReportPeriodSelector';
import { BusinessSummaryCard } from './components/BusinessSummaryCard';
import { ReportSectionCard } from './components/ReportSectionCard';
import { SalesReportCard } from './components/SalesReportCard';
import { CustomerReportCard } from './components/CustomerReportCard';
import { SupplierReportCard } from './components/SupplierReportCard';
import { PurchaseReportCard } from './components/PurchaseReportCard';
import { CashFlowReportCard } from './components/CashFlowReportCard';
import { ProfitabilityReportCard } from './components/ProfitabilityReportCard';
import { InventoryReportCard } from './components/InventoryReportCard';
import { EmptyState } from '../../shared/components/EmptyState';
import type { ReportPeriod, SalesReportSection, CustomerReportSection, SupplierReportSection, PurchaseReportSection, CashFlowReportSection, ProfitabilityReportSection, InventoryReportSection } from './types';
import BarChartIcon from '@mui/icons-material/BarChart';

interface Props {
    workspaceId: string;
}

export function ReportsPage({ workspaceId }: Props) {
    const [period, setPeriod] = useState<ReportPeriod>('today');
    const { data, isLoading, error } = useReports(workspaceId, period);

    const SECTIONS = [
        { id: 'sales', title: 'Sales' },
        { id: 'inventory', title: 'Inventory' },
        { id: 'customers', title: 'Customers' },
        { id: 'suppliers', title: 'Suppliers' },
        { id: 'purchases', title: 'Purchases' },
        { id: 'profitability', title: 'Profitability' },
        { id: 'cashFlow', title: 'Cash Flow' }
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Reports
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Business insights and performance metrics.
                </Typography>
            </Box>

            <ReportPeriodSelector period={period} onChange={setPeriod} />

            {error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    Failed to load reports. Please try again.
                </Alert>
            ) : isLoading ? (
                <Box>
                    <Skeleton variant="rectangular" height={150} sx={{ mb: 3, borderRadius: 2 }} />
                    <Grid container spacing={3}>
                        {SECTIONS.map((section) => (
                            <Grid item xs={12} md={6} lg={4} key={section.id}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ) : !data || !data.sections ? (
                <EmptyState
                    icon={<BarChartIcon sx={{ fontSize: 48 }} />}
                    title="No report data available for this period."
                    description="Change the reporting period or check back later."
                />
            ) : (
                <Box>
                    <BusinessSummaryCard aiSummary={data.aiSummary} />
                    <Grid container spacing={3}>
                        {SECTIONS.map((section) => (
                            <Grid item xs={12} md={6} lg={4} key={section.id}>
                                {section.id === 'sales' && data.sections.sales ? (
                                    <SalesReportCard title={section.title} data={data.sections.sales as SalesReportSection} />
                                ) : section.id === 'inventory' && data.sections.inventory ? (
                                    <InventoryReportCard title={section.title} data={data.sections.inventory as InventoryReportSection} />
                                ) : section.id === 'customers' && data.sections.customers ? (
                                    <CustomerReportCard title={section.title} data={data.sections.customers as CustomerReportSection} />
                                ) : section.id === 'suppliers' && data.sections.suppliers ? (
                                    <SupplierReportCard title={section.title} data={data.sections.suppliers as SupplierReportSection} />
                                ) : section.id === 'purchases' && data.sections.purchases ? (
                                    <PurchaseReportCard title={section.title} data={data.sections.purchases as PurchaseReportSection} />
                                ) : section.id === 'profitability' && data.sections.profitability ? (
                                    <ProfitabilityReportCard title={section.title} data={data.sections.profitability as ProfitabilityReportSection} />
                                ) : section.id === 'cashFlow' && data.sections.cashFlow ? (
                                    <CashFlowReportCard title={section.title} data={data.sections.cashFlow as CashFlowReportSection} />
                                ) : (
                                    <ReportSectionCard title={section.title} />
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}
