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
import Link from '@mui/material/Link';
import { useAuth } from '../hooks/useAuth';
import { authService, type LoginPayload } from '../services/auth.service';
import { setAuthData } from '../store/authStore';
import NextLink from '../components/NextLink';

export const OwnerLoginPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [from, setFrom] = useState('/dashboard');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const redirectFrom = urlSearchParams.get('from') ?? '/dashboard';
    setFrom(redirectFrom);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(from);
    }
  }, [isAuthenticated, router, from]);

  const { register, handleSubmit } = useForm<LoginPayload>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.loginOwner({
        email: values.email,
        password: values.password,
      });

      const { data } = response;
      if (data.success && data.data) {
        setAuthData(data.data.token, data.data.user);
        toast.success(data.message || 'Successfully signed in as Owner!');
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
          
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box textAlign="center">
            <Typography fontWeight={700} variant="h5">
              Owner Sign in
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Access your management dashboard.
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
            color="secondary"
          >
            {isLoading ? 'Signing in...' : 'Login as Owner'}
          </Button>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Don't have an account?{' '}
            <Link component={NextLink} href="/register" variant="body2">
              Sign up
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};
