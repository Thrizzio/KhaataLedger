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
            role="status"
            sx={{
                py: { xs: 6, sm: 8 },
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <Box aria-hidden="true" sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'rgba(15, 138, 131, 0.10)', color: 'secondary.main', mb: 2, display: 'grid', placeItems: 'center', '& > svg': { fontSize: 30 } }}>{icon}</Box>
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
