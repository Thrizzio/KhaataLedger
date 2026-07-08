import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface PageShellProps {
  title: string;
  description: string;
}

export const PageShell = ({ title, description }: PageShellProps) => (
  <Stack spacing={3}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="h4" fontWeight={700}>
        {title}
      </Typography>

      <Button variant="contained">
        + Add Transaction
      </Button>
    </Stack>

    <Paper sx={{ p: 3 }} variant="outlined">
      <Typography color="text.secondary">
        {description}
      </Typography>
    </Paper>
  </Stack>
);