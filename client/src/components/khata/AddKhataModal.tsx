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
import { khataService } from '../../services/khata.service';
import toast from 'react-hot-toast';

interface AddKhataModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  createdById: string;
  onSuccess: () => void;
}

export const AddKhataModal = ({ open, onClose, workspaceId, createdById, onSuccess }: AddKhataModalProps) => {
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [title, setTitle] = useState('');
  const [initialAmount, setInitialAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !title.trim() || initialAmount === '') {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const res = await khataService.createKhata({
        workspaceId,
        customerName: customerName.trim(),
        contactNumber: contactNumber.trim(),
        title: title.trim(),
        initialAmount: Number(initialAmount),
        createdById,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Khata created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(res.data.message || 'Failed to create Khata');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error creating Khata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Add New Khata
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Customer Name *"
              fullWidth
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John Doe"
            />
            <TextField
              label="Contact Number"
              fullWidth
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +91 9876543210"
            />
            <TextField
              label="Title *"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Monthly Groceries"
            />
            <TextField
              label="Initial Amount *"
              type="number"
              fullWidth
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              helperText="Use positive for Dr (You gave), negative for Cr (You got)"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            {loading ? 'Saving...' : 'Save Khata'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
