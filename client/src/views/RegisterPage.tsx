"use client";

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
import { authService, type RegisterPayload } from '../services/auth.service';
import { setAuthData } from '../store/authStore';
import Link from '@mui/material/Link';
import NextLink from '../components/NextLink';

export const RegisterPage = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/workspaces');
    }
  }, [isAuthenticated, router]);

  const { register, handleSubmit } = useForm<RegisterPayload>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterPayload) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      const { data } = response;
      if (data.success && data.data) {
        setAuthData(data.data.token, data.data.user);
        toast.success(data.message || 'Successfully registered!');
      } else {
        toast.error(data.message || 'Failed to register.');
      }
    } catch (error: any) {
      const responseData = error?.response?.data;
      if (responseData?.error?.fieldErrors) {
        const fieldErrors = responseData.error.fieldErrors;
        const firstField = Object.keys(fieldErrors)[0];
        const firstError = fieldErrors[firstField][0];
        toast.error(`Validation error - ${firstField}: ${firstError}`);
      } else {
        const errorMsg = responseData?.message || 'Failed to register. Please try again.';
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, width: '100%' }}>
        <Stack alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box textAlign="center">
            <Typography fontWeight={700} variant="h5">
              Owner Registration
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Register your business and create your owner account.
            </Typography>
          </Box>
          <TextField
            disabled={isLoading}
            fullWidth
            label="Name"
            type="text"
            {...register('name', { required: true })}
          />
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
          >
            {isLoading ? 'Registering...' : 'Register as Owner'}
          </Button>
          <Typography variant="body2" color="text.secondary" mt={2}>
            Already have an account?{' '}
            <Link component={NextLink} href="/login/owner" variant="body2">
              Sign in as Owner
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};
