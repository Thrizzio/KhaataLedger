import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Box
            sx={{
                py: 8,
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <Box sx={{ color: 'text.disabled', mb: 2, '& > svg': { fontSize: 64 } }}>{icon}</Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                {description}
            </Typography>
            {action}
        </Box>
    );
}
