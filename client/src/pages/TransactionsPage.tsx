import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import { useEffect, useState } from 'react';
import { TransactionModal } from '../components/TransactionModal';
import { transactionService } from '../services/transaction.service';

interface TransactionRecord {
  id: string;
  title: string;
  description?: string | null;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  transactionDate: string;
  category?: {
    name?: string;
  } | null;
}

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await transactionService.getTransactions();
        const payload = response.data as unknown;

        if (Array.isArray(payload)) {
          setTransactions(payload as TransactionRecord[]);
        } else if (payload && typeof payload === 'object' && 'data' in payload) {
          const data = (payload as { data?: TransactionRecord[] }).data ?? [];
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Failed to fetch transactions', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatAmount = (amount: number | string) => {
    const numericAmount = typeof amount === 'number' ? amount : Number(amount);

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number.isNaN(numericAmount) ? 0 : numericAmount);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            Transactions
          </Typography>

          <Button variant="contained" onClick={() => setOpenTransactionModal(true)}>
            + Add Transaction
          </Button>
        </Stack>

        <Paper sx={{ p: 3 }} variant="outlined">
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Typography color="text.secondary">No transactions found</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Transaction Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{transaction.title}</TableCell>
                      <TableCell>{transaction.description || '—'}</TableCell>
                      <TableCell>{formatAmount(transaction.amount)}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.category?.name ?? 'Uncategorized'}</TableCell>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <TransactionModal
        open={openTransactionModal}
        onClose={() => setOpenTransactionModal(false)}
      />
    </>
  );
};
