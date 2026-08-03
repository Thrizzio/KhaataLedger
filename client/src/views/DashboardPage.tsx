"use client";

import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { PageShell } from './PageShell';
import { PageHeader } from '../shared/components/PageHeader';
import { MetricCard } from '../shared/components/MetricCard';
import { ActivityTimeline } from '../features/dashboard/components/ActivityTimeline';
import { LowStockTable } from '../features/dashboard/components/LowStockTable';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import { useAuth } from '../hooks/useAuth';
import { Permission } from '../types/auth';
import { usePermission } from '../hooks/usePermission';
import { UnauthorizedView } from '../components/UnauthorizedView';
import type { DashboardMetrics } from '../features/dashboard/types';

interface DashboardPageProps {
  workspaceId?: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/** Returns "Good Morning", "Good Afternoon", or "Good Evening" */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function DashboardMetricsGrid({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading, isError } = useDashboard(workspaceId);

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 4 }}>
        Failed to load dashboard metrics. Please check your connection.
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <Grid container spacing={2.5} mb={4}>
        {Array.from(new Array(6)).map((_, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Skeleton variant="rounded" height={116} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const kpis = [
    { title: "Today's Sales", value: formatCurrency(data.todaySales), icon: <PointOfSaleIcon /> },
    { title: "Today's Purchases", value: formatCurrency(data.todayPurchases), icon: <ShoppingCartIcon /> },
    { title: "Receivables", value: formatCurrency(data.receivables), icon: <AccountBalanceWalletIcon /> },
    { title: "Payables", value: formatCurrency(data.payables), icon: <AccountBalanceWalletIcon /> },
    { title: "Inventory Value", value: formatCurrency(data.inventoryValue), icon: <Inventory2Icon /> },
    { title: "Low Stock Items", value: data.lowStockCount, icon: <WarningAmberIcon /> },
  ];

  return (
    <Grid container spacing={2.5} mb={4}>
      {kpis.map((kpi, idx) => (
        <Grid item xs={12} sm={4} key={idx}>
          <MetricCard title={kpi.title} value={kpi.value} icon={kpi.icon} />
        </Grid>
      ))}
    </Grid>
  );
}

export const DashboardPage = ({ workspaceId }: DashboardPageProps = {}) => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const greeting = getGreeting();
  // Safe default: we should expect workspaceId from the URL params handled by next.js, 
  // but if it's undefined, we can render a safe shell.
  if (!workspaceId) return <PageShell />;

  if (!hasPermission(Permission.DASHBOARD_VIEW)) {
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
        title={`${greeting}, ${firstName}`}
        subtitle="Here's an overview of your business today."
      />

      {/* ── Dashboard Metrics (6 KPI Cards) ─────────────── */}
      <DashboardMetricsGrid workspaceId={workspaceId} />

      {/* ── Secondary Layout (Activity & Low Stock) ─────── */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <ActivityTimeline workspaceId={workspaceId} />
        <LowStockTable workspaceId={workspaceId} />
      </Box>

    </PageShell>
  );
};
