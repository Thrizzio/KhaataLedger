import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface SectionCardProps {
    title?: string;
    action?: ReactNode;
    children: ReactNode;
}

export function SectionCard({ title, action, children }: SectionCardProps) {
    return (
        <Card>
            {(title || action) && (
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    {title && (
                        <Typography variant="h6" component="h2">
                            {title}
                        </Typography>
                    )}
                    {action && <Box>{action}</Box>}
                </Box>
            )}
            <Box sx={{ p: 3 }}>{children}</Box>
        </Card>
    );
}
