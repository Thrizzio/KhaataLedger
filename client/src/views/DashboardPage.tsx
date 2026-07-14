"use client";

import { Box, Grid, Card, CardContent, Typography, Button, Divider, Avatar, Stack } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from './PageShell';
import { useAuth } from '../hooks/useAuth';
import NextLink from '../components/NextLink';
import { workspaceService } from '../services/workspace.service';
import { transactionService, type Transaction } from '../services/transaction.service';
import type { Workspace } from '../types/workspace';

interface DashboardPageProps {
  workspaceId?: string;
}

/** Returns "Good Morning", "Good Afternoon", or "Good Evening" */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const cardSx = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  transition: 'box-shadow 0.2s, transform 0.2s',
  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.10)', transform: 'translateY(-1px)' },
};

export const DashboardPage = ({ workspaceId }: DashboardPageProps = {}) => {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  // Reuses cached entry from WorkspaceDashboardLayout (same queryKey)
  const { data: workspace } = useQuery<Workspace>({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceService.getWorkspaceById(workspaceId!).then((r) => r.data.data as Workspace),
    enabled: Boolean(workspaceId),
  });

  // Live transactions for this workspace — newest first (sorted by backend)
  const { data: allTransactions = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions', workspaceId],
    queryFn: () => transactionService.getTransactions(workspaceId!).then((r) => r.data.data ?? []),
    enabled: Boolean(workspaceId),
  });

  // Derive stats from live data
  const totalIncome = allTransactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = allTransactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  const kpiCards = [
    { label: 'Net Balance', value: formatAmount(netBalance), icon: <AccountBalanceWalletIcon />, avatarBg: 'primary.light', avatarColor: 'primary.main', valueColor: netBalance < 0 ? 'error.main' : 'text.primary' },
    { label: 'Total Income', value: `+${formatAmount(totalIncome)}`, icon: <TrendingUpIcon />, avatarBg: 'success.light', avatarColor: 'success.main', valueColor: 'success.main' },
    { label: 'Total Expenses', value: `-${formatAmount(totalExpenses)}`, icon: <TrendingDownIcon />, avatarBg: 'error.light', avatarColor: 'error.main', valueColor: 'error.main' },
    { label: 'Active Employees', value: String(workspace?.employeeCount ?? 0), icon: <PeopleIcon />, avatarBg: 'secondary.light', avatarColor: 'secondary.main', valueColor: 'text.primary' },
  ];

  // Today's transactions (transactionDate == today), already sorted newest-first by backend
  const todayActivities = allTransactions.filter((t) => isToday(t.transactionDate));

  const allTxHref = workspaceId ? `/workspaces/${workspaceId}/expenses` : '/expenses';
  const greeting = getGreeting();
  const subtitle = workspace?.name
    ? `Here's what's happening at ${workspace.name} today.`
    : "Here's what's happening today.";

  return (
    <PageShell workspaceId={workspaceId}>

      {/* ── Page Header ─────────────────────────────────── */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom lineHeight={1.2}>
          {greeting}, {firstName}
        </Typography>
        <Typography color="text.secondary" variant="body1">
          {subtitle}
        </Typography>
      </Box>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <Grid container spacing={2.5} mb={4}>
        {kpiCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card elevation={0} sx={cardSx}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography color="text.secondary" variant="caption" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={card.valueColor} sx={{ mt: 0.5 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: card.avatarBg, color: card.avatarColor }}>
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Today's Activity ────────────────────────────── */}
      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h6" fontWeight={700}>Today's Activity</Typography>
            <Button component={NextLink} href={allTxHref} size="small" sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13 }}>
              View all
            </Button>
          </Stack>
          <Divider />

          {todayActivities.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary" variant="body2">
                No transactions recorded today.
              </Typography>
            </Box>
          ) : (
            todayActivities.map((item, index) => {
              const isExpense = item.type === 'EXPENSE';
              return (
                <Box key={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.75 }}>
                    <Avatar sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: isExpense ? 'error.light' : 'success.light', color: isExpense ? 'error.main' : 'success.main' }}>
                      {isExpense ? <ArrowDownwardIcon sx={{ fontSize: 16 }} /> : <ArrowUpwardIcon sx={{ fontSize: 16 }} />}
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {isExpense ? 'Expense' : 'Income'}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                      {formatTime(item.transactionDate)}
                    </Typography>

                    <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0, minWidth: 80, textAlign: 'right', color: isExpense ? 'error.main' : 'success.main' }}>
                      {isExpense ? '-' : '+'}{formatAmount(Number(item.amount))}
                    </Typography>
                  </Box>
                  {index < todayActivities.length - 1 && <Divider />}
                </Box>
              );
            })
          )}

          <Box textAlign="center" mt={1.5}>
            <Button component={NextLink} href={allTxHref} size="small" color="primary" sx={{ textTransform: 'none', fontWeight: 500 }}>
              View All Transactions
            </Button>
          </Box>

        </CardContent>
      </Card>

    </PageShell>
  );
};
