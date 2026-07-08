import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { TransactionModal } from "../components/TransactionModal";

interface PageShellProps {
  title: string;
  description: string;
}

export const PageShell = ({ title, description }: PageShellProps) => {
  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  const handleOpenModal = () => setOpenTransactionModal(true);
  const handleCloseModal = () => setOpenTransactionModal(false);

  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>

          <Button variant="contained" onClick={handleOpenModal}>
            + Add Transaction
          </Button>
        </Stack>

        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography color="text.secondary">
            {description}
          </Typography>
        </Paper>
      </Stack>

      <TransactionModal
        open={openTransactionModal}
        onClose={handleCloseModal}
      />
    </>
  );
};