import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface SectionCardProps {
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
}

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
    return (
        <Card sx={{ overflow: 'hidden' }}>
            {(title || subtitle || action) && (
                <Box
                    sx={{
                        px: { xs: 2, sm: 2.5 },
                        py: 1.75,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    {(title || subtitle) && (
                        <Box sx={{ minWidth: 0 }}>
                            {title && <Typography variant="h6" component="h2">{title}</Typography>}
                            {subtitle && <Typography variant="caption" component="p" sx={{ mt: 0.25 }}>{subtitle}</Typography>}
                        </Box>
                    )}
                    {action && <Box>{action}</Box>}
                </Box>
            )}
            <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
        </Card>
    );
}
