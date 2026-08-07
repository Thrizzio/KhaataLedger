import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Grid } from '@mui/material';
import type { SupplierReportSection } from '../types';

interface Props {
    title: string;
    data: SupplierReportSection;
}

export function SupplierReportCard({ title, data }: Props) {
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
                    {data.topSuppliersByPurchaseValue && data.topSuppliersByPurchaseValue.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Top Suppliers by Purchase Value
                            </Typography>
                            {data.topSuppliersByPurchaseValue.map((s, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{s.name}</Typography>
                                    <Typography variant="body2" fontWeight="500">{s.amount}</Typography>
                                </Box>
                            ))}
                        </Grid>
                    )}
                    {data.topSuppliersByPurchaseCount && data.topSuppliersByPurchaseCount.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 1 }}>
                                Top Suppliers by Purchase Count
                            </Typography>
                            {data.topSuppliersByPurchaseCount.map((s, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{s.name}</Typography>
                                    <Typography variant="body2" fontWeight="500" sx={{ color: 'primary.main' }}>
                                        {s.amount}
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
