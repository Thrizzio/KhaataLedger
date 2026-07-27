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
        <Card sx={{ p: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" color="text.primary" sx={{ mb: title ? 1 : 0 }}>
                    {value}
                </Typography>
                {trend && <Box sx={{ mt: 1 }}>{trend}</Box>}
            </Box>
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    display: 'flex',
                    opacity: 0.8,
                }}
            >
                {icon}
            </Box>
        </Card>
    );
}
