"use client";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TransactionModal } from '../components/TransactionModal';
import { transactionService, type Transaction } from '../services/transaction.service';

interface TransactionsPageProps {
  workspaceId: string;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const TransactionsPage = ({ workspaceId }: TransactionsPageProps) => {
  const [openModal, setOpenModal] = useState(false);

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', workspaceId],
    queryFn: () => transactionService.getTransactions(workspaceId).then((r) => r.data.data ?? []),
    enabled: Boolean(workspaceId),
  });

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
        onClose={() => setOpenModal(false)}
        workspaceId={workspaceId}
      />
    </>
  );
};
