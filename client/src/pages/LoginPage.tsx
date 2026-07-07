import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForm } from 'react-hook-form';
import type { LoginPayload } from '../services/auth.service';

export const LoginPage = () => {
  const { register, handleSubmit } = useForm<LoginPayload>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (_values: LoginPayload) => {
    // Authentication business logic will be connected once the API is implemented.
  };

  return (
    <Container maxWidth="xs" sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, width: '100%' }}>
        <Stack alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Box textAlign="center">
            <Typography fontWeight={700} variant="h5">
              Sign in
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Access your digital ledger workspace.
            </Typography>
          </Box>
          <TextField fullWidth label="Email" type="email" {...register('email')} />
          <TextField fullWidth label="Password" type="password" {...register('password')} />
          <Button fullWidth size="large" type="submit" variant="contained">
            Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};
