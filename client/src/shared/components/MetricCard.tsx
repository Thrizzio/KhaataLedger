import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: ReactNode;
}

export function MetricCard({ title, value, icon, trend }: MetricCardProps) {
    return (
        <Card sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h4" color="text.primary" sx={{ mb: title ? 0.75 : 0, fontSize: { xs: '1.4rem', sm: '1.6rem' }, overflowWrap: 'anywhere' }}>
                    {value}
                </Typography>
                {trend && <Box sx={{ mt: 1 }}>{trend}</Box>}
            </Box>
            <Box
                sx={{
                    p: 1.25,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(15, 138, 131, 0.10)',
                    color: 'secondary.main',
                    display: 'flex',
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', bgcolor: 'secondary.main' }} />
        </Card>
    );
}
