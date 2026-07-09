"use client";

import { Box, Grid, Card, CardContent, Typography, Button, IconButton, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { PageShell } from './PageShell';
import { useAuth } from '../hooks/useAuth';

export const DashboardPage = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  return (
    <PageShell title={isOwner ? "Owner Dashboard" : "Employee Portal"}>
      <Box mb={4}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name || 'User'}!
        </Typography>
        <Typography color="text.secondary">
          Here is what's happening with your business today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                    Total Balance
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    $12,450
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                  <AccountBalanceWalletIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                    Monthly Income
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    +$8,200
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                    Monthly Expenses
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    -$3,150
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                  <TrendingDownIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                    Active Employees
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    12
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions & Recent Activity */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={2}>
                <Button variant="contained" startIcon={<AddIcon />} fullWidth>
                  Record Income
                </Button>
                <Button variant="outlined" color="error" startIcon={<AddIcon />} fullWidth>
                  Record Expense
                </Button>
                {isOwner && (
                  <Button variant="outlined" color="secondary" startIcon={<PeopleIcon />} fullWidth>
                    Manage Employees
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <Divider />
              <List>
                {[
                  { id: 1, title: 'Office Supplies', desc: 'Paid via Credit Card', amount: '-$150.00', isExpense: true },
                  { id: 2, title: 'Client Payment - Acme Corp', desc: 'Invoice #INV-2023', amount: '+$2,500.00', isExpense: false },
                  { id: 3, title: 'Software Subscriptions', desc: 'Monthly Auto-pay', amount: '-$89.99', isExpense: true },
                ].map((item, index) => (
                  <Box key={item.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: item.isExpense ? 'error.light' : 'success.light', color: item.isExpense ? 'error.main' : 'success.main' }}>
                          <ReceiptIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.title} secondary={item.desc} />
                      <Typography variant="subtitle1" fontWeight="bold" color={item.isExpense ? 'error.main' : 'success.main'}>
                        {item.amount}
                      </Typography>
                    </ListItem>
                    {index < 2 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
              <Box textAlign="center" mt={2}>
                <Button size="small" color="primary">View All Transactions</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageShell>
  );
};

export default DashboardPage;
