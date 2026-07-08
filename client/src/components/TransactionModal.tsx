import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export const TransactionModal = ({ open, onClose }: TransactionModalProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Add Transaction</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <TextField label="Amount" type="number" required fullWidth />

        <TextField select label="Type" required fullWidth defaultValue="CREDIT">
          <MenuItem value="CREDIT">CREDIT</MenuItem>
          <MenuItem value="DEBIT">DEBIT</MenuItem>
        </TextField>

        <TextField select label="Customer" required fullWidth defaultValue="">
          <MenuItem value="">None</MenuItem>
          <MenuItem value="customer-1">Customer 1</MenuItem>
          <MenuItem value="customer-2">Customer 2</MenuItem>
          <MenuItem value="customer-3">Customer 3</MenuItem>
        </TextField>

        <TextField label="Note" multiline minRows={3} fullWidth />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onClose} variant="contained">
        Save
      </Button>
    </DialogActions>
  </Dialog>
);
