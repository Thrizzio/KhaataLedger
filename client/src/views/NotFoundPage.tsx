import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextLink from '../components/NextLink';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';

export const NotFoundPage = () => (
  <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', py: 4 }}>
    <Box sx={{ width: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3, p: { xs: 3, sm: 5 }, boxShadow: '0 14px 40px rgba(16,35,63,0.07)' }}>
      <Stack alignItems="center" spacing={2} textAlign="center">
        <Box sx={{ width: 64, height: 64, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'rgba(15,138,131,0.10)', color: 'secondary.main' }}>
          <SearchOffRoundedIcon sx={{ fontSize: 32 }} aria-hidden="true" />
        </Box>
        <Typography color="secondary.main" fontWeight={800} variant="h2" sx={{ fontSize: '3rem' }}>
          404
        </Typography>
        <Typography fontWeight={750} variant="h5">
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
          The page you are looking for does not exist or has moved.
        </Typography>
        <Button component={NextLink} href="/workspaces" variant="contained" color="primary" startIcon={<ArrowBackRoundedIcon />} sx={{ mt: 1 }}>
          Go to workspaces
        </Button>
      </Stack>
    </Box>
  </Container>
);
