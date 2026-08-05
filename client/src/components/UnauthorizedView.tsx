import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LockIcon from '@mui/icons-material/Lock';
import { useRouter } from 'next/navigation';

export const UnauthorizedView = () => {
    const router = useRouter();

    return (
        <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            minHeight="60vh"
            textAlign="center"
        >
            <LockIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                You don't have permission to view this page.
            </Typography>
            <Button variant="contained" onClick={() => router.back()}>
                Go Back
            </Button>
        </Box>
    );
};
