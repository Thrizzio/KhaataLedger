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
import { SupplierLedger } from '../features/suppliers/components/SupplierLedger';
import { useSupplier } from '../features/suppliers/hooks/useSupplier';

interface SupplierDetailPageProps {
    workspaceId: string;
    supplierId: string;
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const SupplierDetailPage = ({ workspaceId, supplierId }: SupplierDetailPageProps) => {
    const { data: supplier, isLoading, isError, refetch } = useSupplier(workspaceId, supplierId);

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
                <PageHeader title="Supplier unavailable" subtitle="We couldn’t load this supplier right now." />
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>} sx={{ mb: 2 }}>
                    The supplier details and ledger could not be loaded.
                </Alert>
                <Button component={Link} href={`/workspaces/${workspaceId}/suppliers`} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back to Suppliers
                </Button>
            </PageShell>
        );
    }

    if (!supplier) {
        return (
            <PageShell workspaceId={workspaceId}>
                <PageHeader title="Supplier not found" subtitle="This supplier may have been removed or the link may be incorrect." />
                <Button component={Link} href={`/workspaces/${workspaceId}/suppliers`} variant="outlined" startIcon={<ArrowBackIcon />}>
                    Back to Suppliers
                </Button>
            </PageShell>
        );
    }

    return (
        <PageShell workspaceId={workspaceId}>
            <Button component={Link} href={`/workspaces/${workspaceId}/suppliers`} color="inherit" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Suppliers
            </Button>

            <PageHeader
                title={supplier.name}
                subtitle="View detailed supplier information and complete chronological ledger history."
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Profile Details</Typography>

                            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box display="flex" alignItems="flex-start" gap={1.5}>
                                    <PhoneIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{supplier.phoneNumber || 'No phone number'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" gap={1.5}>
                                    <EmailIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{supplier.email || 'No email address'}</Typography>
                                </Box>
                                <Box display="flex" alignItems="flex-start" gap={1.5}>
                                    <LocationOnIcon fontSize="small" color="action" />
                                    <Typography variant="body2">{supplier.address || 'No billing address'}</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="body2" color="text.secondary" gutterBottom>Outstanding Payable</Typography>
                            <Typography variant="h4" color={supplier.outstandingBalance > 0 ? 'error.main' : 'success.main'} fontWeight={700}>
                                {formatCurrency(supplier.outstandingBalance)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <SupplierLedger workspaceId={workspaceId} supplierId={supplierId} />
                </Grid>
            </Grid>
        </PageShell>
    );
};
