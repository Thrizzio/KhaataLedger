import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Grid } from '@mui/material';
import type { PurchaseReportSection } from '../types';

interface Props {
    title: string;
    data: PurchaseReportSection;
}

export function PurchaseReportCard({ title, data }: Props) {
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
                    {data.mostPurchasedProducts && data.mostPurchasedProducts.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Most Frequently Purchased Products
                            </Typography>
                            {data.mostPurchasedProducts.map((p, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{p.product}</Typography>
                                    <Typography variant="body2" fontWeight="500">{p.quantity}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                    {data.largestPurchases && data.largestPurchases.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Largest Purchases
                            </Typography>
                            {data.largestPurchases.map((p, idx) => (
                                <Box key={idx} mb={1}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="500">{p.supplier}</Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ color: 'error.main' }}>{p.amount}</Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {p.date}
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
