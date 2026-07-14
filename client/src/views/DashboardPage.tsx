"use client";

import { Box, Grid, Card, CardContent, Typography, Button, Divider, Avatar, Stack } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { PageShell } from './PageShell';
import { useAuth } from '../hooks/useAuth';
import NextLink from '../components/NextLink';
import { workspaceService } from '../services/workspace.service';
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

const kpiCards = [
  { label: 'Total Balance', value: '$12,450', icon: <AccountBalanceWalletIcon />, avatarBg: 'primary.light', avatarColor: 'primary.main', valueColor: 'text.primary' },
  { label: 'Monthly Income', value: '+$8,200', icon: <TrendingUpIcon />, avatarBg: 'success.light', avatarColor: 'success.main', valueColor: 'success.main' },
  { label: 'Monthly Expenses', value: '-$3,150', icon: <TrendingDownIcon />, avatarBg: 'error.light', avatarColor: 'error.main', valueColor: 'error.main' },
  { label: 'Active Employees', value: '12', icon: <PeopleIcon />, avatarBg: 'secondary.light', avatarColor: 'secondary.main', valueColor: 'text.primary' },
];

const todayActivities = [
  { id: 1, title: 'Office Supplies', desc: 'Paid via Credit Card', time: '6:39 pm', amount: '-$150.00', isExpense: true },
  { id: 2, title: 'Client Payment - Acme Corp', desc: 'Invoice #INV-2023', time: '5:09 pm', amount: '+$2,500.00', isExpense: false },
  { id: 3, title: 'Software Subscriptions', desc: 'Monthly Auto-pay', time: '5:03 pm', amount: '-$89.99', isExpense: true },
];

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

  // Reuses the cached query from WorkspaceDashboardLayout (same queryKey)
  const { data: workspace } = useQuery<Workspace>({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceService.getWorkspaceById(workspaceId!).then((r) => r.data.data as Workspace),
    enabled: Boolean(workspaceId),
  });

  const allTxHref = workspaceId ? `/workspaces/${workspaceId}/expenses` : '/expenses';
  const greeting = getGreeting();
  const subtitle = workspace?.name
    ? `Here's what's happening at ${workspace.name} today.`
    : "Here's what's happening today.";

  return (
    <PageShell title="">

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
                    <Typography variant="h4" fontWeight={700} color={card.valueColor} sx={{ mt: 0.5, fontSize: { xs: '1.5rem', lg: '1.8rem' } }}>
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

      {/* ── Today's Activity (full width — Quick Actions removed) ── */}
      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="h6" fontWeight={700}>Today's Activity</Typography>
            <Button component={NextLink} href={allTxHref} size="small" sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13 }}>
              View all
            </Button>
          </Stack>
          <Divider />

          {todayActivities.map((item, index) => (
            <Box key={item.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.75 }}>
                <Avatar
                  sx={{
                    width: 36, height: 36, flexShrink: 0,
                    bgcolor: item.isExpense ? 'error.light' : 'success.light',
                    color: item.isExpense ? 'error.main' : 'success.main',
                  }}
                >
                  {item.isExpense
                    ? <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                    : <ArrowUpwardIcon sx={{ fontSize: 16 }} />}
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{item.desc}</Typography>
                </Box>

                <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                  {item.time}
                </Typography>

                <Typography
                  variant="body2" fontWeight={700}
                  sx={{ flexShrink: 0, minWidth: 80, textAlign: 'right', color: item.isExpense ? 'error.main' : 'success.main' }}
                >
                  {item.amount}
                </Typography>
              </Box>
              {index < todayActivities.length - 1 && <Divider />}
            </Box>
          ))}

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
