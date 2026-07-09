"use client";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { authService, type LoginPayload } from '../services/auth.service';
import { setAuthData } from '../store/authStore';
import NextLink from '../components/NextLink';

export const EmployeeLoginPage = () => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated as employee, redirect to their workspace
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'EMPLOYEE' && user.workspaceId) {
        router.replace(`/workspaces/${user.workspaceId}/dashboard`);
      } else if (user.role === 'OWNER') {
        router.replace('/workspaces');
      }
    }
  }, [isAuthenticated, user, router]);

  const { register, handleSubmit } = useForm<LoginPayload>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.loginEmployee({
        email: values.email,
        password: values.password,
      });

      const { data } = response;
      if (data.success && data.data) {
        setAuthData(data.data.token, data.data.user);
        toast.success(data.message || 'Successfully signed in as Employee!');
        // Redirect immediately using the workspaceId from the response
        const userData = data.data.user;
        if (userData.workspaceId) {
          router.replace(`/workspaces/${userData.workspaceId}/dashboard`);
        } else {
          toast.error('No workspace assigned. Contact your owner.');
        }
      } else {
        toast.error(data.message || 'Failed to authenticate.');
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Invalid email or password.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, width: '100%' }}>
        <Stack alignItems="center" spacing={2}>
          <Box alignSelf="flex-start">
            <Button component={NextLink} href="/login" startIcon={<ArrowBackIcon />} size="small" color="inherit">
              Back
            </Button>
          </Box>

          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box textAlign="center">
            <Typography fontWeight={700} variant="h5">
              Employee Sign in
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Access your work portal.
            </Typography>
          </Box>
          <TextField
            disabled={isLoading}
            fullWidth
            label="Email"
            type="email"
            {...register('email', { required: true })}
          />
          <TextField
            disabled={isLoading}
            fullWidth
            label="Password"
            type="password"
            {...register('password', { required: true })}
          />
          <Button
            disabled={isLoading}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            color="primary"
          >
            {isLoading ? 'Signing in...' : 'Login as Employee'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
