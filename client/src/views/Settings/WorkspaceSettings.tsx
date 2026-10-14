'use client';

import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { workspaceService } from '../../services/workspace.service';
import { getAuthState } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import type { Workspace } from '../../types/workspace';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { getApiErrorDetails } from '../../api/apiError';

interface Props {
    workspaceId: string;
}

export const WorkspaceSettings: React.FC<Props> = ({ workspaceId }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const user = getAuthState().user;
    const isOwner = user?.role === 'OWNER';

    const { data: workspace, isLoading, isError, error, refetch } = useQuery<Workspace>({
        queryKey: ['workspace', workspaceId],
        queryFn: () => workspaceService.getWorkspaceById(workspaceId).then(res => res.data.data as Workspace),
    });

    useEffect(() => {
        if (workspace) {
            setName(workspace.name);
        }
    }, [workspace]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        setHasChanges(e.target.value !== workspace?.name);
    };

    const handleSave = async () => {
        if (!isOwner) return;
        setIsSaving(true);
        try {
            const res = await workspaceService.updateWorkspace(workspaceId, name);
            if (res.data.success && res.data.data) {
                queryClient.setQueryData(['workspace', workspaceId], res.data.data);
                setHasChanges(false);
                toast.success('Workspace updated successfully');
            } else {
                toast.error(res.data.message || 'Failed to update workspace');
            }
        } catch (error: unknown) {
            toast.error(getApiErrorDetails(error, 'Error updating workspace').message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <CircularProgress aria-label="Loading workspace settings" />;
    if (isError) {
        return (
            <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
                {getApiErrorDetails(error, 'Workspace settings could not be loaded.').message}
            </Alert>
        );
    }
    if (!workspace) return <Alert severity="warning">Workspace not found.</Alert>;

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Workspace Settings</h1>
                <p className={styles.description}>Manage your workspace details and settings.</p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionBody}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Workspace Name</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={name}
                            onChange={handleChange}
                            disabled={!isOwner}
                        />
                        {!isOwner && <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Only owners can edit the workspace name.</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Members</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={workspace.employeeCount || 0}
                                disabled
                            />
                        </div>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Created At</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={new Date(workspace.createdAt).toLocaleDateString()}
                                disabled
                            />
                        </div>
                    </div>
                </div>
            </div>

            {hasChanges && isOwner && (
                <div className={styles.saveBar}>
                    <span className={styles.saveBarText}>You have unsaved changes</span>
                    <div className={styles.saveBarActions}>
                        <button 
                            className={styles.saveBarButton + ' ' + styles.saveBarButtonSecondary}
                            onClick={() => {
                                setName(workspace.name);
                                setHasChanges(false);
                            }}
                        >
                            Discard
                        </button>
                        <button 
                            className={styles.saveBarButton + ' ' + styles.saveBarButtonPrimary}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
