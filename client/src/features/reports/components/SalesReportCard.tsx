import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import type { SalesReportSection } from '../types';

interface Props {
    title: string;
    data: SalesReportSection;
}

export function SalesReportCard({ title, data }: Props) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                    {data.growth && (
                        <Box display="flex" alignItems="center" color={data.growth.direction === 'up' ? 'success.main' : 'error.main'}>
                            {data.growth.direction === 'up' ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />}
                            <Typography variant="body2" fontWeight="bold">
                                {data.growth.value}%
                            </Typography>
                        </Box>
                    )}
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
                            data.metrics.map((m, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{m.label}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{m.value}</TableCell>
                                </TableRow>
                            ))
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
                    {data.bestSellingProducts && data.bestSellingProducts.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Best Selling Products
                            </Typography>
                            {data.bestSellingProducts.map((p, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{p.product}</Typography>
                                    <Typography variant="body2" fontWeight="500">{p.quantity}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                    {data.worstSellingProducts && data.worstSellingProducts.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Worst Selling Products
                            </Typography>
                            {data.worstSellingProducts.map((p, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{p.product}</Typography>
                                    <Typography variant="body2" fontWeight="500">{p.quantity}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                    {data.topCustomers && data.topCustomers.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Top Customers
                            </Typography>
                            {data.topCustomers.map((c, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{c.name}</Typography>
                                    <Typography variant="body2" fontWeight="500">{c.amount}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
