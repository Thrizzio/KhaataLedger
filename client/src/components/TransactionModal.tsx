"use client";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { transactionService } from '../services/transaction.service';
import { getAuthState } from '../store/authStore';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export const TransactionModal = ({ open, onClose }: TransactionModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [transactionDate, setTransactionDate] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setType('INCOME');
    setTransactionDate('');
    setCategory('');
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title || !amount || !type || !transactionDate || !category) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const currentUser = getAuthState().user;
    if (!currentUser?.id) {
      toast.error('Please sign in to add a transaction.');
      return;
    }

    setIsLoading(true);

    try {
      await transactionService.createTransaction({
        title,
        description: description || undefined,
        amount: Number(amount),
        type,
        transactionDate,
        categoryId: category,
        createdById: currentUser.id,
      });

      toast.success('Transaction added successfully');
      resetForm();
      onClose();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to add transaction.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Transaction</DialogTitle>
      <form onSubmit={handleSave}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <TextField
              label="Description"
              multiline
              minRows={3}
              fullWidth
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <TextField
              label="Amount"
              type="number"
              required
              fullWidth
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputProps={{ min: 0, step: '0.01' }}
            />

            <TextField
              select
              label="Type"
              required
              fullWidth
              value={type}
              onChange={(event) => setType(event.target.value as 'INCOME' | 'EXPENSE')}
            >
              <MenuItem value="INCOME">INCOME</MenuItem>
              <MenuItem value="EXPENSE">EXPENSE</MenuItem>
            </TextField>

            <TextField
              label="Transaction Date"
              type="date"
              required
              fullWidth
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              label="Category"
              required
              fullWidth
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="office">Office</MenuItem>
              <MenuItem value="travel">Travel</MenuItem>
              <MenuItem value="utilities">Utilities</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="misc">Miscellaneous</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
