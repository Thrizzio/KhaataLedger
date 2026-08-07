import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Grid } from '@mui/material';
import type { InventoryReportSection } from '../types';

interface Props {
    title: string;
    data: InventoryReportSection;
}

export function InventoryReportCard({ title, data }: Props) {
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
                    {data.lowStockProducts && data.lowStockProducts.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Low Stock Products
                            </Typography>
                            {data.lowStockProducts.map((p, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{p.product}</Typography>
                                    <Typography variant="body2" fontWeight="500" sx={{ color: 'warning.main' }}>
                                        {p.stock} <span style={{ color: 'grey', fontSize: '0.8em' }}>/ {p.reorderLevel}</span>
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}

                    {data.outOfStockProducts && data.outOfStockProducts.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Out of Stock Products
                            </Typography>
                            {data.outOfStockProducts.map((p, idx) => (
                                <Box key={idx} mb={1}>
                                    <Typography variant="body2" sx={{ color: 'error.main', fontWeight: '500' }}>
                                        {p.product}
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}

                    {data.highestStockProducts && data.highestStockProducts.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Highest Stock Products
                            </Typography>
                            {data.highestStockProducts.map((p, idx) => (
                                <Box key={idx} mb={1} display="flex" justifyContent="space-between">
                                    <Typography variant="body2" fontWeight="500">{p.product}</Typography>
                                    <Typography variant="body2" fontWeight="500" sx={{ color: 'success.main' }}>{p.stock}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
