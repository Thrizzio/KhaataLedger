"use client";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const TransactionModal = dynamic(
  () => import('../components/TransactionModal').then((mod) => mod.TransactionModal),
  { ssr: false }
);
import { transactionService, type Transaction } from '../services/transaction.service';
import { useAuth } from '../hooks/useAuth';

interface TransactionsPageProps {
  workspaceId: string;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

export const TransactionsPage = ({ workspaceId }: TransactionsPageProps) => {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';

  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Overflow menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', workspaceId],
    queryFn: () => transactionService.getTransactions(workspaceId).then((r) => r.data.data ?? []),
    enabled: Boolean(workspaceId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['reports', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['audit', workspaceId] });
      toast.success('Transaction deleted');
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Failed to delete transaction');
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tx: Transaction) => {
    setAnchorEl(event.currentTarget);
    setSelectedTx(tx);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTx(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    setEditingTx(selectedTx);
    setOpenModal(true);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteTarget(selectedTx);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingTx(null);
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={700}>Transactions</Typography>
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Transaction
          </Button>
        </Stack>

        <Paper sx={{ p: 3, borderRadius: 3 }} variant="outlined">
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No transactions found for this workspace.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography fontWeight={600} fontSize={13}>Title</Typography></TableCell>
                    <TableCell><Typography fontWeight={600} fontSize={13}>Amount</Typography></TableCell>
                    <TableCell><Typography fontWeight={600} fontSize={13}>Type</Typography></TableCell>
                    <TableCell><Typography fontWeight={600} fontSize={13}>Date</Typography></TableCell>
                    <TableCell><Typography fontWeight={600} fontSize={13}>Added By</Typography></TableCell>
                    {isOwner && <TableCell />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Typography fontSize={14} fontWeight={500}>{tx.title}</Typography>
                        {tx.description && (
                          <Typography fontSize={12} color="text.secondary" noWrap sx={{ maxWidth: 200 }}>{tx.description}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color={tx.type === 'INCOME' ? 'success.main' : 'error.main'}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatAmount(tx.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type}
                          size="small"
                          color={tx.type === 'INCOME' ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{formatDate(tx.transactionDate)}</TableCell>
                      <TableCell>{tx.createdBy?.name ?? '—'}</TableCell>
                      {isOwner && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, tx)} aria-label="Transaction actions">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedTx?.id === tx.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={handleEdit}>
                              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                              Edit
                            </MenuItem>
                            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                              <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                              Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <TransactionModal
        open={openModal}
        onClose={closeModal}
        workspaceId={workspaceId}
        transaction={editingTx}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Transaction?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
