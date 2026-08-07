import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import type { ReportPeriod } from '../types';

interface Props {
    period: ReportPeriod;
    onChange: (period: ReportPeriod) => void;
}

export function ReportPeriodSelector({ period, onChange }: Props) {
    return (
        <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
                color="primary"
                value={period}
                exclusive
                onChange={(_, newPeriod) => {
                    if (newPeriod) onChange(newPeriod);
                }}
                aria-label="Reporting Period"
                size="small"
            >
                <ToggleButton value="today">Today</ToggleButton>
                <ToggleButton value="week">This Week</ToggleButton>
                <ToggleButton value="month">This Month</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
