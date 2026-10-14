'use client';

import BadgeIcon from '@mui/icons-material/Badge';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from '../components/NextLink';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export const LoginPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === 'EMPLOYEE' && user.workspaceId) {
      router.replace(`/workspaces/${user.workspaceId}/dashboard`);
    } else if (user.role === 'OWNER') {
      router.replace('/workspaces');
    }
  }, [isAuthenticated, router, user]);

  return (
    <Container maxWidth="sm" sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh', justifyContent: 'center' }}>
      <Box textAlign="center" width="100%">
        <Typography fontWeight={800} variant="h3" color="primary" gutterBottom>
          KhaataLedger
        </Typography>
        <Typography color="text.secondary" variant="subtitle1" mb={6}>
          Please select your role to continue
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
          <Card elevation={4} sx={{ borderRadius: 3, flex: 1 }}>
            <CardActionArea component={NextLink} href="/login/owner" sx={{ p: 4, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <StorefrontIcon color="secondary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Owner
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Sign in to manage your workspace, employees, and operations.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card elevation={4} sx={{ borderRadius: 3, flex: 1 }}>
            <CardActionArea component={NextLink} href="/login/employee" sx={{ p: 4, height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BadgeIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Employee
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Sign in to access your work portal and complete tasks.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
};
