"use client";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { khataService } from '../services/khata.service';
import NextLink from '../components/NextLink';
import { AddKhataEntryModal } from '../components/khata/AddKhataEntryModal';
import { useAuth } from '../hooks/useAuth';

interface KhataDetailsPageProps {
  workspaceId: string;
  khataId: string;
}

export const KhataDetailsPage = ({ workspaceId, khataId }: KhataDetailsPageProps) => {
  const { user } = useAuth();
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false);

  const { data: khataResponse, isLoading: isKhataLoading, error: khataError, refetch: refetchKhata } = useQuery({
    queryKey: ['khata', khataId],
    queryFn: () => khataService.getKhataDetails(khataId),
  });

  const { data: entriesResponse, isLoading: isEntriesLoading, error: entriesError, refetch: refetchEntries } = useQuery({
    queryKey: ['khata-entries', khataId],
    queryFn: () => khataService.getKhataEntries(khataId),
  });

  const khata = khataResponse?.data?.data;
  const entries = entriesResponse?.data?.data || [];

  const handleSuccess = () => {
    refetchKhata();
    refetchEntries();
  };

  if (isKhataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (khataError || !khata) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load Khata details.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Button
        component={NextLink}
        href={`/workspaces/${workspaceId}/khata`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
      >
        Back to Khatas
      </Button>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
            <Box>
              <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: 1 }}>
                {khata.title}
              </Typography>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mt: 0.5 }}>
                {khata.customerName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {khata.contactNumber || 'No contact provided'}
              </Typography>
            </Box>

            <Box sx={{ textAlign: { xs: 'left', md: 'right' }, bgcolor: 'grey.50', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'grey.100', minWidth: { md: 250 } }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
                Total Pending Amount
              </Typography>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                color={khata.pendingAmount > 0 ? 'error.main' : khata.pendingAmount < 0 ? 'success.main' : 'text.primary'}
              >
                ₹{Math.abs(khata.pendingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" fontWeight={600} color={khata.pendingAmount > 0 ? 'error.main' : khata.pendingAmount < 0 ? 'success.main' : 'text.secondary'}>
                {khata.pendingAmount !== 0 ? 'Outstanding Amount' : 'Settled'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Entry History
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddEntryModalOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Add Entry
        </Button>
      </Box>

      {isEntriesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : entriesError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load entry history.
        </Alert>
      ) : entries.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No entries yet
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Click "Add Entry" to record a new transaction.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {/* Initial Amount as the first logical entry (though rendered at bottom of list functionally if we reverse, but let's just show actual entries) */}
          {entries.map((entry) => (
            <Card key={entry.id} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'transform 0.1s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} mb={0.5}>
                      {entry.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">•</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Added by {entry.createdBy?.name || 'Unknown'}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700}
                      color={entry.type === 'CREDIT' ? 'error.main' : 'success.main'}
                    >
                      {entry.type === 'CREDIT' ? '+' : '-'} ₹{Number(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {entry.type === 'CREDIT' ? 'Credit' : 'Payment'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {khata.initialAmount !== 0 && (
             <Card sx={{ borderRadius: 2, bgcolor: 'grey.50', boxShadow: 'none', border: '1px dashed', borderColor: 'divider' }}>
             <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
               <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                 <Box>
                   <Typography variant="body1" fontWeight={600} mb={0.5} color="text.secondary">
                     Initial Amount
                   </Typography>
                   <Typography variant="body2" color="text.secondary">
                     {new Date(khata.createdAt).toLocaleDateString()}
                   </Typography>
                 </Box>
                 <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                   <Typography 
                     variant="body1" 
                     fontWeight={700}
                     color={khata.initialAmount > 0 ? 'error.main' : khata.initialAmount < 0 ? 'success.main' : 'text.primary'}
                   >
                     ₹{Math.abs(khata.initialAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                   </Typography>
                   <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {khata.initialAmount > 0 ? 'Credit' : khata.initialAmount < 0 ? 'Payment' : 'Zero Balance'}
                    </Typography>
                 </Box>
               </Stack>
             </CardContent>
           </Card>
          )}
        </Stack>
      )}

      {isAddEntryModalOpen && (
        <AddKhataEntryModal
          open={isAddEntryModalOpen}
          onClose={() => setIsAddEntryModalOpen(false)}
          khataId={khataId}
          createdById={user?.id || ''}
          onSuccess={handleSuccess}
        />
      )}
    </Box>
  );
};
