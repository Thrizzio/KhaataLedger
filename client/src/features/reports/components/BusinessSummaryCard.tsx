import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReportPeriod } from '../types';

interface Props {
    period: ReportPeriod;
}

export function BusinessSummaryCard({ period }: Props) {
    const periodLabel = period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month';

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Business Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        Report Period: {periodLabel}
                    </Typography>
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        Data generated successfully.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
