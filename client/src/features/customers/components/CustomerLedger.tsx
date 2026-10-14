import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { useCustomerLedger } from '../hooks/useCustomerLedger';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SectionCard } from '../../../shared/components/SectionCard';

interface CustomerLedgerProps {
    workspaceId: string;
    customerId: string;
}

const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function CustomerLedger({ workspaceId, customerId }: CustomerLedgerProps) {
    const { data, isLoading, isError, refetch } = useCustomerLedger(workspaceId, customerId);

    if (isError) {
        return (
            <SectionCard title="Ledger Timeline">
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                    This customer&apos;s ledger could not be loaded.
                </Alert>
            </SectionCard>
        );
    }

    const entries = data?.ledger || [];

    return (
        <SectionCard title="Ledger Timeline">
            {isLoading ? (
                <Box>
                    {Array.from(new Array(4)).map((_, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 2 }}>
                            <Skeleton variant="circular" width={40} height={40} />
                            <Box flex={1}>
                                <Skeleton width="40%" />
                                <Skeleton width="60%" />
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : entries.length === 0 ? (
                <EmptyState
                    icon={<AccountBalanceWalletIcon />}
                    title="Ledger is empty"
                    description="This customer does not have any recorded credit sales or payments yet."
                />
            ) : (
                entries.map((item, index) => {
                    const isSale = item.type === 'SALE_CREDIT' || item.type === 'SALE';
                    const isPayment = item.type === 'PAYMENT';

                    return (
                        <Box key={item.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: isPayment ? 'success.light' : 'error.light', color: isPayment ? 'success.main' : 'error.main' }}>
                                    {isPayment ? <PaymentsIcon /> : <ShoppingCartIcon />}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(item.entryDate)}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0, minWidth: 90, textAlign: 'right', color: isPayment ? 'success.main' : 'error.main' }}>
                                    {isPayment ? '-' : '+'}{formatAmount(Number(item.amount))}
                                </Typography>
                            </Box>
                            {index < entries.length - 1 && <Divider />}
                        </Box>
                    );
                })
            )}
        </SectionCard>
    );
}
