import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from '../components/NextLink';

export const NotFoundPage = () => (
  <Container maxWidth="sm" sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
    <Stack alignItems="center" spacing={2} textAlign="center">
      <Typography color="primary" fontWeight={800} variant="h2">
        404
      </Typography>
      <Typography fontWeight={700} variant="h5">
        Page not found
      </Typography>
      <Typography color="text.secondary">
        The page you are looking for does not exist or has moved.
      </Typography>
      <Button component={NextLink} href="/workspaces" variant="contained">
        Go to dashboard
      </Button>
    </Stack>
  </Container>
);

export default NotFoundPage;
