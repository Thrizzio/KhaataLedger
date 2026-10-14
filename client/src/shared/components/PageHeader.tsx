import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <Box
            component="header"
            sx={{
                mb: { xs: 3, md: 4 },
                display: 'flex',
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
            }}
        >
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                <Typography variant="h4" component="h1" color="text.primary" sx={{ fontSize: { xs: '1.6rem', sm: '1.85rem' } }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Stack>
            {action && <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>{action}</Box>}
        </Box>
    );
}
