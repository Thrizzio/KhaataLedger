import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { useSupplierLedger } from '../hooks/useSupplierLedger';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SectionCard } from '../../../shared/components/SectionCard';

interface SupplierLedgerProps {
    workspaceId: string;
    supplierId: string;
}

const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export function SupplierLedger({ workspaceId, supplierId }: SupplierLedgerProps) {
    const { data, isLoading, isError } = useSupplierLedger(workspaceId, supplierId);

    if (isError) {
        return (
            <SectionCard title="Ledger Timeline">
                <EmptyState
                    icon={<AccountBalanceWalletIcon />}
                    title="Could not load ledger"
                    description="There was a problem fetching the supplier's chronological timeline."
                />
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
                    description="This supplier does not have any recorded credit purchases or payments yet."
                />
            ) : (
                entries.map((item, index) => {
                    const isPurchase = item.type === 'PURCHASE';
                    const isPayment = item.type === 'PAYMENT';

                    return (
                        <Box key={item.referenceId + index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: isPayment ? 'success.light' : 'error.light', color: isPayment ? 'success.main' : 'error.main' }}>
                                    {isPayment ? <PaymentsIcon /> : <ShoppingCartIcon />}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(item.date)}
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
