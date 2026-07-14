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
import { useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';
import { getAuthState } from '../store/authStore';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  /** The workspace this transaction belongs to */
  workspaceId: string;
}

export const TransactionModal = ({ open, onClose, workspaceId }: TransactionModalProps) => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [transactionDate, setTransactionDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAmount('');
    setType('INCOME');
    setTransactionDate('');
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title || !amount || !type || !transactionDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const currentUser = getAuthState().user;
    if (!currentUser?.id) {
      toast.error('Please sign in to add a transaction.');
      return;
    }

    if (!workspaceId) {
      toast.error('No workspace selected.');
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
        createdById: currentUser.id,
        workspaceId,
      });

      toast.success('Transaction added successfully');
      resetForm();
      onClose();

      // ── Live updates: invalidate all affected queries ──────────────────
      // Transactions list on the expenses page
      await queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] });
      // Dashboard data (Today's Activity + stats use the same key)
      await queryClient.invalidateQueries({ queryKey: ['transactions-today', workspaceId] });
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
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              label="Description"
              multiline
              minRows={2}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <TextField
              label="Amount"
              type="number"
              required
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0, step: '0.01' }}
            />

            <TextField
              select
              label="Type"
              required
              fullWidth
              value={type}
              onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
            >
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </TextField>

            <TextField
              label="Transaction Date"
              type="date"
              required
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />


          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
