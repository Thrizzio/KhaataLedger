import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Grid } from '@mui/material';
import type { CashFlowReportSection } from '../types';

interface Props {
    title: string;
    data: CashFlowReportSection;
}

export function CashFlowReportCard({ title, data }: Props) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </Box>
                <Table size="small" sx={{ mb: 3 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell align="right">Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.metrics && data.metrics.length > 0 ? (
                            data.metrics.map((m, idx) => {
                                let color = 'text.primary';
                                if (m.status === 'Positive') color = 'success.main';
                                else if (m.status === 'Negative') color = 'error.main';
                                else if (m.status === 'Neutral') color = 'text.secondary';

                                return (
                                    <TableRow key={idx}>
                                        <TableCell>{m.label}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', color }}>
                                            {m.value}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    —
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Grid container spacing={2}>
                    {data.paymentBreakdown && data.paymentBreakdown.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Payment Breakdown
                            </Typography>
                            {data.paymentBreakdown.map((p, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{p.source}</Typography>
                                    <Typography variant="body2" fontWeight="500">{p.amount}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                    {data.largestInflows && data.largestInflows.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Largest Incoming Transactions
                            </Typography>
                            {data.largestInflows.map((t, idx) => (
                                <Box key={idx} mb={1}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="500">{t.source}</Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ color: 'success.main' }}>
                                            {t.amount}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {t.date}
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                    {data.largestOutflows && data.largestOutflows.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Largest Outgoing Transactions
                            </Typography>
                            {data.largestOutflows.map((t, idx) => (
                                <Box key={idx} mb={1}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="500">{t.supplier}</Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ color: 'error.main' }}>
                                            {t.amount}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {t.date}
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
