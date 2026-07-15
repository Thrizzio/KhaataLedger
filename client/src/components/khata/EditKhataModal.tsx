"use client";

import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { khataService, type Khata } from '../../services/khata.service';
import toast from 'react-hot-toast';

interface EditKhataModalProps {
  open: boolean;
  khata: Khata;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditKhataModal = ({ open, khata, onClose, onSuccess }: EditKhataModalProps) => {
  const [customerName, setCustomerName] = useState(khata.customerName);
  const [contactNumber, setContactNumber] = useState(khata.contactNumber);
  const [initialAmount, setInitialAmount] = useState<number | ''>(khata.initialAmount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCustomerName(khata.customerName);
    setContactNumber(khata.contactNumber);
    setInitialAmount(khata.initialAmount);
  }, [khata]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || initialAmount === '') {
      toast.error('Customer name and initial amount are required');
      return;
    }

    try {
      setLoading(true);
      const res = await khataService.updateKhata(khata.id, {
        customerName: customerName.trim(),
        contactNumber: contactNumber.trim(),
        initialAmount: Number(initialAmount),
      });

      if (res.data.success) {
        toast.success('Khata updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to update Khata');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error updating Khata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Edit Khata
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Customer Name *"
              fullWidth
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <TextField
              label="Contact Number"
              fullWidth
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
            />
            <TextField
              label="Initial Amount *"
              type="number"
              fullWidth
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
