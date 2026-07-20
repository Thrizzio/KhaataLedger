"use client";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { transactionService, type Transaction } from '../services/transaction.service';
import { getAuthState } from '../store/authStore';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  /** The workspace this transaction belongs to */
  workspaceId: string;
  /** When provided, the modal opens in edit mode pre-filled with this transaction */
  transaction?: Transaction | null;
}

/** Convert an ISO timestamp into a local YYYY-MM-DD value for the date input */
const toDateInputValue = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export const TransactionModal = ({ open, onClose, workspaceId, transaction }: TransactionModalProps) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(transaction);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [transactionDate, setTransactionDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill the form when opening in edit mode
  useEffect(() => {
    if (open && transaction) {
      setTitle(transaction.title);
      setDescription(transaction.description ?? '');
      setAmount(String(transaction.amount));
      setType(transaction.type);
      setTransactionDate(toDateInputValue(transaction.transactionDate));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction]);

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
      const payload = {
        title,
        description: description || undefined,
        amount: Number(amount),
        type,
        transactionDate,
      };

      if (isEdit && transaction) {
        await transactionService.updateTransaction(transaction.id, payload);
        toast.success('Transaction updated successfully');
      } else {
        await transactionService.createTransaction({
          ...payload,
          workspaceId,
        });
        toast.success('Transaction added successfully');
      }

      resetForm();
      onClose();

      // ── Live updates: invalidate all affected queries ──────────────────
      // Transactions list + Today's Activity + dashboard stats all use this key
      await queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] });
      // Audit log entries for this workspace
      await queryClient.invalidateQueries({ queryKey: ['audit', workspaceId] });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || (isEdit ? 'Failed to update transaction.' : 'Failed to add transaction.');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
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
              label="Type"
              select
              required
              fullWidth
              value={type}
              onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
            >
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </TextField>

            <TextField
              label="Transaction Date & Time"
              type="datetime-local"
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
            {isLoading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update' : 'Save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
