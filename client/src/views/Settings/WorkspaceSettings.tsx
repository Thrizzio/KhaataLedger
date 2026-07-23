'use client';

import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { workspaceService } from '../../services/workspace.service';
import { getAuthState } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import type { Workspace } from '../../types/workspace';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

    const { data: workspace, isLoading } = useQuery<Workspace>({
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
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error updating workspace');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <p>Loading workspace...</p>;
    if (!workspace) return <p>Workspace not found</p>;

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
