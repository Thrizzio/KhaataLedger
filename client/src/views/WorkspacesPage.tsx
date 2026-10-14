"use client";

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import toast from 'react-hot-toast';
import { workspaceService } from '../services/workspace.service';
import { setAuthData } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { useWorkspace } from '../hooks/useWorkspace';
import { PageHeader } from '../shared/components/PageHeader';
import { EmptyState } from '../shared/components/EmptyState';

export const WorkspacesPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const { setWorkspaceId, clearWorkspaceId } = useWorkspace();
    const queryClient = useQueryClient();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    const { data, isLoading, isError, refetch } = useQuery({
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

    const closeCreateDialog = () => {
        setCreateDialogOpen(false);
        setNewWorkspaceName('');
    };

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
        clearWorkspaceId();
        router.replace('/login');
    };

    const handleOpenWorkspace = (workspaceId: string) => {
        setWorkspaceId(workspaceId);
        router.push(`/workspaces/${workspaceId}/dashboard`);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Box component="header" sx={{ bgcolor: 'primary.main', color: 'common.white' }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ minHeight: 72, gap: 1.25 }}>
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'secondary.main', color: 'common.white', display: 'grid', placeItems: 'center' }}>
                            <BusinessRoundedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Typography fontWeight={800} sx={{ flexGrow: 1, letterSpacing: '-0.02em' }}>KhaataLedger</Typography>
                        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.16)', color: 'common.white', fontSize: 13, fontWeight: 750 }}>
                                {user?.name?.[0]?.toUpperCase() ?? 'U'}
                            </Avatar>
                            <Typography variant="body2" fontWeight={650} sx={{ display: { xs: 'none', sm: 'block' } }}>{user?.name}</Typography>
                            <IconButton onClick={handleLogout} size="small" aria-label="Log out" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                                <LogoutRoundedIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Toolbar>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
                <PageHeader
                    title="Your workspaces"
                    subtitle="Choose where you want to work, or create a new workspace for another business."
                    action={<Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={() => setCreateDialogOpen(true)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Create workspace</Button>}
                />

                {isLoading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }} aria-label="Loading workspaces">
                        {[0, 1, 2].map((item) => <Card key={item}><CardContent><Skeleton variant="rounded" width={44} height={44} sx={{ mb: 2 }} /><Skeleton width="70%" /><Skeleton width="50%" sx={{ mt: 1 }} /><Skeleton width="100%" height={38} sx={{ mt: 3 }} /></CardContent></Card>)}
                    </Box>
                ) : isError ? (
                    <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                        Workspaces could not be loaded. Check your connection and try again.
                    </Alert>
                ) : !data || data.length === 0 ? (
                    <Paper variant="outlined" sx={{ borderStyle: 'dashed' }}>
                        <EmptyState
                            icon={<BusinessRoundedIcon />}
                            title="No workspaces yet"
                            description="Create your first workspace to start organizing your ledger and daily operations."
                            action={<Button variant="contained" color="secondary" startIcon={<AddRoundedIcon />} onClick={() => setCreateDialogOpen(true)}>Create workspace</Button>}
                        />
                    </Paper>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                        {data.map((workspace) => (
                            <Card key={workspace.id} sx={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform .18s ease, box-shadow .18s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(16,35,63,0.10)' } }}>
                                <CardContent sx={{ flexGrow: 1, p: { xs: 2.25, sm: 2.5 } }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(15,138,131,0.11)', color: 'secondary.main', width: 44, height: 44 }}><BusinessRoundedIcon /></Avatar>
                                        <Typography variant="h6" noWrap>{workspace.name}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip icon={<PeopleAltOutlinedIcon />} label={`${workspace.employeeCount} employee${workspace.employeeCount !== 1 ? 's' : ''}`} size="small" variant="outlined" />
                                        <Chip icon={<CalendarTodayOutlinedIcon />} label={new Date(workspace.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} size="small" variant="outlined" />
                                    </Stack>
                                </CardContent>
                                <CardActions sx={{ p: 2, pt: 0 }}>
                                    <Button variant="contained" fullWidth color="primary" endIcon={<ArrowForwardRoundedIcon />} onClick={() => handleOpenWorkspace(workspace.id)}>Open workspace</Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>
                )}
            </Container>

            <Dialog open={createDialogOpen} onClose={createMutation.isPending ? undefined : closeCreateDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Create a new workspace</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Give this workspace a name your team will recognize.</Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Workspace name"
                        value={newWorkspaceName}
                        onChange={(event) => setNewWorkspaceName(event.target.value)}
                        onKeyDown={(event) => { if (event.key === 'Enter') handleCreateWorkspace(); }}
                        disabled={createMutation.isPending}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCreateDialog} color="inherit" disabled={createMutation.isPending}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleCreateWorkspace} disabled={createMutation.isPending || !newWorkspaceName.trim()} startIcon={createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
                        {createMutation.isPending ? 'Creating…' : 'Create workspace'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
