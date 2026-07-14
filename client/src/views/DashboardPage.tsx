"use client";

import { Box, Grid, Card, CardContent, Typography, Button, Divider, Avatar, Stack } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { PageShell } from './PageShell';
import { useAuth } from '../hooks/useAuth';
import NextLink from '../components/NextLink';

interface DashboardPageProps {
  workspaceId?: string;
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
  elevation: 0,
  sx: {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.10)', transform: 'translateY(-1px)' },
  },
};

export const DashboardPage = ({ workspaceId }: DashboardPageProps = {}) => {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
  const allTxHref = workspaceId ? `/workspaces/${workspaceId}/expenses` : '/expenses';

  return (
    <PageShell title={isOwner ? 'Owner Dashboard' : 'Employee Portal'}>

      {/* Welcome */}
      <Box mb={3.5}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Here is what's happening with your business today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={4}>
        {kpiCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Card {...cardSx}>
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

      {/* Quick Actions + Today's Activity */}
      <Grid container spacing={3}>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card {...cardSx} sx={{ ...cardSx.sx, height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="h6" fontWeight={700} mb={2}>Quick Actions</Typography>
              <Divider sx={{ mb: 2.5 }} />
              <Stack spacing={1.5}>
                <Button variant="contained" startIcon={<AddIcon />} fullWidth sx={{ borderRadius: 2, py: 1.25, textTransform: 'none', fontWeight: 600 }}>
                  Record Income
                </Button>
                <Button variant="outlined" color="error" startIcon={<AddIcon />} fullWidth sx={{ borderRadius: 2, py: 1.25, textTransform: 'none', fontWeight: 600 }}>
                  Record Expense
                </Button>
                {isOwner && (
                  <Button variant="outlined" color="secondary" startIcon={<PeopleIcon />} fullWidth sx={{ borderRadius: 2, py: 1.25, textTransform: 'none', fontWeight: 600 }}>
                    Manage Employees
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Activity */}
        <Grid item xs={12} md={8}>
          <Card {...cardSx} sx={{ ...cardSx.sx, height: '100%' }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>

              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="h6" fontWeight={700}>Today's Activity</Typography>
                <Button component={NextLink} href={allTxHref} size="small" sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13 }}>
                  View all
                </Button>
              </Stack>
              <Divider />

              {/* Rows */}
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
                        : <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                      }
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
                      sx={{ flexShrink: 0, minWidth: 72, textAlign: 'right', color: item.isExpense ? 'error.main' : 'success.main' }}
                    >
                      {item.amount}
                    </Typography>
                  </Box>
                  {index < todayActivities.length - 1 && <Divider />}
                </Box>
              ))}

              {/* Footer link */}
              <Box textAlign="center" mt={1.5}>
                <Button component={NextLink} href={allTxHref} size="small" color="primary" sx={{ textTransform: 'none', fontWeight: 500 }}>
                  View All Transactions
                </Button>
              </Box>

            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </PageShell>
  );
};
