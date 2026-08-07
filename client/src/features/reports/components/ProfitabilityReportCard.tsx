import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Grid } from '@mui/material';
import type { ProfitabilityReportSection } from '../types';

interface Props {
    title: string;
    data: ProfitabilityReportSection;
}

export function ProfitabilityReportCard({ title, data }: Props) {
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
                                else if (m.status === 'Neutral') color = 'warning.main';
                                else if (m.label === 'Profitability Status') {
                                    if (m.value === 'Excellent' || m.value === 'Healthy') color = 'success.main';
                                    else if (m.value === 'Average') color = 'warning.main';
                                    else if (m.value === 'Low') color = 'error.main';
                                }

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
                    {data.highestRevenueProducts && data.highestRevenueProducts.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Highest Revenue Products
                            </Typography>
                            {data.highestRevenueProducts.map((p, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{p.product}</Typography>
                                    <Typography variant="body2" fontWeight="500">{p.revenue}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                    {data.topCustomers && data.topCustomers.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Most Profitable Customers
                            </Typography>
                            {data.topCustomers.map((c, idx) => (
                                <Box key={idx} mb={1}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="500">{c.name}</Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ color: 'success.main' }}>
                                            {c.amount}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
