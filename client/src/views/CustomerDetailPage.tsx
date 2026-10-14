"use client";

import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { PageShell } from './PageShell';
import { PageHeader } from '../shared/components/PageHeader';
import { CustomerLedger } from '../features/customers/components/CustomerLedger';
import { useCustomer } from '../features/customers/hooks/useCustomer';

interface CustomerDetailPageProps {
    workspaceId: string;
    customerId: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const CustomerDetailPage = ({ workspaceId, customerId }: CustomerDetailPageProps) => {
    const { data: customer, isLoading, isError, refetch } = useCustomer(workspaceId, customerId);

    if (isLoading) {
        return (
            <PageShell workspaceId={workspaceId}>
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            </PageShell>
        );
    }

    if (isError) {
        return (
            <PageShell workspaceId={workspaceId}>
                <PageHeader title="Customer unavailable" subtitle="We couldn’t load this customer right now." />
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>} sx={{ mb: 2 }}>
                    The customer details and ledger could not be loaded.
                </Alert>
                <Button component={Link} href={`/workspaces/${workspaceId}/customers`} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back to Customers
                </Button>
            </PageShell>
        );
    }

    if (!customer) {
        return (
            <PageShell workspaceId={workspaceId}>
                <PageHeader title="Customer not found" subtitle="This customer may have been removed or the link may be incorrect." />
                <Button component={Link} href={`/workspaces/${workspaceId}/customers`} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back to Customers
                </Button>
            </PageShell>
        );
    }

    return (
        <PageShell workspaceId={workspaceId}>
            <Button component={Link} href={`/workspaces/${workspaceId}/customers`} color="inherit" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Customers
            </Button>

            <PageHeader
                title={customer.name}
                subtitle="View detailed customer information and complete chronological ledger history."
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Customer Profile Card */}
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Profile Details</Typography>

                            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box display="flex" alignItems="flex-start" gap={1.5}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{customer.phoneNumber || 'No phone number'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" gap={1.5}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{customer.email || 'No email address'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" gap={1.5}>
                                    <LocationOnIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{customer.address || 'No billing address'}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="body2" color="text.secondary" gutterBottom>Outstanding Balance</Typography>
                            <Typography variant="h4" color={customer.outstandingBalance > 0 ? 'error.main' : 'success.main'} fontWeight={700}>
                                {formatCurrency(customer.outstandingBalance)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <CustomerLedger workspaceId={workspaceId} customerId={customerId} />
                </Grid>
            </Grid>
        </PageShell>
    );
};
