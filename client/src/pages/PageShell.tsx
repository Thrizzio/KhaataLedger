import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface PageShellProps {
  title: string;
  description: string;
}

export const PageShell = ({ title, description }: PageShellProps) => (
  <Stack spacing={3}>
    <Typography fontWeight={700} variant="h4">
      {title}
    </Typography>
    <Paper sx={{ p: 3 }} variant="outlined">
      <Typography color="text.secondary">{description}</Typography>
    </Paper>
  </Stack>
);
