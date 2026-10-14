import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PaymentsIcon from '@mui/icons-material/Payments';
import HistoryIcon from '@mui/icons-material/History';
import { useActivity } from '../hooks/useActivity';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SectionCard } from '../../../shared/components/SectionCard';

const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

export function ActivityTimeline({ workspaceId }: { workspaceId: string }) {
    const { data: activities, isLoading, isError, refetch } = useActivity(workspaceId);

    if (isError) {
        return (
            <SectionCard title="Today's Activity">
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                    Today&apos;s activity could not be loaded.
                </Alert>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Today's Activity">
            {isLoading ? (
                <Box>
                    {Array.from(new Array(4)).map((_, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.5 }}>
                            <Skeleton variant="circular" width={36} height={36} />
                            <Box flex={1}>
                                <Skeleton width="40%" />
                                <Skeleton width="20%" />
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : !activities || activities.length === 0 ? (
                <EmptyState
                    icon={<HistoryIcon />}
                    title="No recent activity yet."
                    description="Transactions from today will appear here."
                />
            ) : (
                activities.map((item, index) => {
                    const isNegative = item.type === 'EXPENSE' || item.type === 'PURCHASE';

                    let icon = <ArrowUpwardIcon fontSize="small" />;
                    let subtitle = 'Income';
                    if (item.type === 'EXPENSE') { icon = <ArrowDownwardIcon fontSize="small" />; subtitle = 'Expense'; }
                    if (item.type === 'SALE') { icon = <PointOfSaleIcon fontSize="small" />; subtitle = 'Sale'; }
                    if (item.type === 'PURCHASE') { icon = <ShoppingCartIcon fontSize="small" />; subtitle = 'Purchase'; }
                    if (item.type === 'PAYMENT') { icon = <PaymentsIcon fontSize="small" />; subtitle = 'Payment'; }

                    return (
                        <Box key={item.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.75 }}>
                                <Avatar sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: isNegative ? 'error.light' : 'success.light', color: isNegative ? 'error.main' : 'success.main' }}>
                                    {icon}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>{item.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
                                </Box>
                                <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                                    {formatTime(item.transactionDate)}
                                </Typography>
                                <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0, minWidth: 80, textAlign: 'right', color: isNegative ? 'error.main' : 'success.main' }}>
                                    {isNegative ? '-' : '+'}{formatAmount(Number(item.amount))}
                                </Typography>
                            </Box>
                            {index < activities.length - 1 && <Divider />}
                        </Box>
                    );
                })
            )}
        </SectionCard>
    );
}
