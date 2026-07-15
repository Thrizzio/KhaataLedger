"use client";

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useQuery } from '@tanstack/react-query';
import { khataService, type Khata } from '../services/khata.service';
import NextLink from '../components/NextLink';
import { AddKhataModal } from '../components/khata/AddKhataModal';
import { EditKhataModal } from '../components/khata/EditKhataModal';
import { useAuth } from '../hooks/useAuth';

interface KhataPageProps {
  workspaceId: string;
}

export const KhataPage = ({ workspaceId }: KhataPageProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [editingKhata, setEditingKhata] = useState<Khata | null>(null);

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['khatas', workspaceId],
    queryFn: () => khataService.getKhatas(workspaceId),
  });

  const khatas = response?.data?.data || [];

  const filteredAndSortedKhatas = React.useMemo(() => {
    let result = [...khatas];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (k) =>
          k.customerName.toLowerCase().includes(q) ||
          (k.contactNumber && k.contactNumber.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'customerName') {
        return a.customerName.localeCompare(b.customerName);
      } else if (sortBy === 'pendingAmountDesc') {
        return b.pendingAmount - a.pendingAmount;
      } else if (sortBy === 'pendingAmountAsc') {
        return a.pendingAmount - b.pendingAmount;
      } else {
        // latest activity
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [khatas, searchQuery, sortBy]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 4, gap: 2 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Khata Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Add Khata
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
        <TextField
          placeholder="Search by customer name or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          slotProps={{
            input: {
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon color="action" />
                    </InputAdornment>
                ),
            }
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ borderRadius: 2, bgcolor: 'background.paper' }}
          >
            <MenuItem value="latest">Latest Activity</MenuItem>
            <MenuItem value="customerName">Customer Name</MenuItem>
            <MenuItem value="pendingAmountDesc">Highest Pending Amount</MenuItem>
            <MenuItem value="pendingAmountAsc">Lowest Pending Amount</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Failed to load Khatas. Please try again.
        </Alert>
      ) : filteredAndSortedKhatas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Khatas found
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Get started by adding a new Khata for your customers.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedKhatas.map((khata) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={khata.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="overline" color="primary.main" fontWeight={700} sx={{ letterSpacing: 1 }}>
                    {khata.title}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 0.5, lineHeight: 1.2 }}>
                    {khata.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {khata.contactNumber || 'No contact provided'}
                  </Typography>
                  
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mt: 2, border: '1px solid', borderColor: 'grey.100' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Outstanding Amount
                    </Typography>
                    <Typography 
                      variant="h4" 
                      fontWeight={700} 
                      color={khata.pendingAmount > 0 ? 'error.main' : khata.pendingAmount < 0 ? 'success.main' : 'text.primary'}
                      sx={{ mt: 0.5 }}
                    >
                      ₹{Math.abs(khata.pendingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Last Updated: {new Date(khata.updatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                  <Button
                    component={NextLink}
                    href={`/workspaces/${workspaceId}/khata/${khata.id}`}
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    onClick={() => setEditingKhata(khata)}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddKhataModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          workspaceId={workspaceId}
          createdById={user?.id || ''}
          onSuccess={refetch}
        />
      )}

      {editingKhata && (
        <EditKhataModal
          open={!!editingKhata}
          khata={editingKhata}
          onClose={() => setEditingKhata(null)}
          onSuccess={refetch}
        />
      )}
    </Box>
  );
};
