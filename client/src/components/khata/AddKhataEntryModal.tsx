"use client";

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { khataService } from '../../services/khata.service';
import toast from 'react-hot-toast';

interface AddKhataEntryModalProps {
  open: boolean;
  onClose: () => void;
  khataId: string;
  createdById: string;
  onSuccess: () => void;
}

export const AddKhataEntryModal = ({ open, onClose, khataId, createdById, onSuccess }: AddKhataEntryModalProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'CREDIT' | 'PAYMENT'>('CREDIT');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount === '' || amount <= 0) {
      toast.error('Please provide a valid title and amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      const res = await khataService.addKhataEntry(khataId, {
        title: title.trim(),
        amount: Number(amount),
        type,
        entryDate: new Date(entryDate).toISOString(),
        createdById,
      });

      if (res.data.success) {
        toast.success('Entry added successfully');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to add entry');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error adding entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Add New Entry
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>Entry Type</FormLabel>
              <RadioGroup
                row
                value={type}
                onChange={(e) => setType(e.target.value as 'CREDIT' | 'PAYMENT')}
              >
                <FormControlLabel value="CREDIT" control={<Radio color="error" />} label="Credit" sx={{ mr: 4 }} />
                <FormControlLabel value="PAYMENT" control={<Radio color="success" />} label="Payment" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Title *"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Paid for goods"
            />
            
            <TextField
              label="Amount *"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              inputProps={{ min: "0", step: "0.01" }}
            />

            <TextField
              label="Date & Time *"
              type="datetime-local"
              fullWidth
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            {loading ? 'Saving...' : 'Save Entry'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
