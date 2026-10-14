import { Card, CardContent, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { EmptyState } from '../../../shared/components/EmptyState';

interface Props {
    title: string;
}

export function ReportSectionCard({ title }: Props) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <EmptyState
                    icon={<BarChartIcon />}
                    title="No data for this period"
                    description="Try a different reporting period to see this section."
                />
            </CardContent>
        </Card>
    );
}
