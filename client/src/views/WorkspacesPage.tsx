"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import toast from 'react-hot-toast';
import { workspaceService } from '../services/workspace.service';
import { setAuthData } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

export const WorkspacesPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['workspaces'],
        queryFn: () => workspaceService.getWorkspaces().then((r) => r.data.data ?? []),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => workspaceService.createWorkspace(name),
        onSuccess: (response) => {
            toast.success(response.data.message || 'Workspace created!');
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            setCreateDialogOpen(false);
            setNewWorkspaceName('');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create workspace.');
        },
    });

    const handleCreateWorkspace = () => {
        const trimmed = newWorkspaceName.trim();
        if (!trimmed) {
            toast.error('Workspace name cannot be empty.');
            return;
        }
        createMutation.mutate(trimmed);
    };

    const handleLogout = () => {
        setAuthData(null, null);
        router.replace('/login');
    };

    const handleOpenWorkspace = (workspaceId: string) => {
        router.push(`/workspaces/${workspaceId}/dashboard`);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Top App Bar */}
            <AppBar color="inherit" elevation={0} position="sticky" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Toolbar>
                    <BusinessIcon color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                    <Typography color="primary" fontWeight={800} variant="h6" sx={{ flexGrow: 1 }}>
                        KhaataLedger
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                            {user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                            {user?.name}
                        </Typography>
                        <IconButton onClick={handleLogout} size="small" title="Logout">
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 4 }, py: 5 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Your Workspaces
                        </Typography>
                        <Typography color="text.secondary">
                            Select a workspace to open or create a new one.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        size="large"
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Create Workspace
                    </Button>
                </Stack>

                {/* Content */}
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={10}>
                        <CircularProgress />
                    </Box>
                ) : isError ? (
                    <Typography color="error" textAlign="center">
                        Failed to load workspaces. Please try again.
                    </Typography>
                ) : !data || data.length === 0 ? (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 12,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 3,
                        }}
                    >
                        <BusinessIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No workspaces yet
                        </Typography>
                        <Typography color="text.disabled" mb={3}>
                            Create your first workspace to get started.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Workspace
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {data.map((workspace) => (
                            <Grid item xs={12} sm={6} md={4} key={workspace.id}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        borderRadius: 3,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'box-shadow 0.2s',
                                        '&:hover': { boxShadow: 6 },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 44, height: 44 }}>
                                                <BusinessIcon />
                                            </Avatar>
                                            <Typography variant="h6" fontWeight={700} noWrap>
                                                {workspace.name}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>
                                            <Chip
                                                icon={<PeopleIcon />}
                                                label={`${workspace.employeeCount} Employee${workspace.employeeCount !== 1 ? 's' : ''}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label="₹ — Expenses"
                                                size="small"
                                                variant="outlined"
                                                color="default"
                                            />
                                        </Stack>
                                    </CardContent>

                                    <CardActions sx={{ px: 2, pb: 2 }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={() => handleOpenWorkspace(workspace.id)}
                                        >
                                            Open Workspace
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Create Workspace Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => {
                    setCreateDialogOpen(false);
                    setNewWorkspaceName('');
                }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle fontWeight={700}>Create New Workspace</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Workspace Name"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateWorkspace();
                        }}
                        sx={{ mt: 1 }}
                        disabled={createMutation.isPending}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => {
                            setCreateDialogOpen(false);
                            setNewWorkspaceName('');
                        }}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateWorkspace}
                        disabled={createMutation.isPending || !newWorkspaceName.trim()}
                    >
                        {createMutation.isPending ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
