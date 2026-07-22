'use client';

import React, { useState } from 'react';
import styles from './Settings.module.css';
import { getAuthState, setAuthData } from '../../store/authStore';
import { userService } from '../../services/user.service';
import { workspaceService } from '../../services/workspace.service';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Props {
    workspaceId: string;
}

export const DangerZone: React.FC<Props> = ({ workspaceId }) => {
    const user = getAuthState().user;
    const isOwner = user?.role === 'OWNER';
    const router = useRouter();

    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This action cannot be undone. All your personal data will be permanently deleted.')) {
            return;
        }

        setIsDeletingAccount(true);
        try {
            const res = await userService.deleteAccount();
            if (res.data.success) {
                toast.success('Account deleted');
                setAuthData(null, null);
                router.push('/login');
            } else {
                toast.error(res.data.message || 'Failed to delete account');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error deleting account');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!window.confirm('Are you absolutely sure you want to delete this workspace? All data, transactions, and Khatas will be permanently removed.')) {
            return;
        }

        setIsDeletingWorkspace(true);
        try {
            const res = await workspaceService.deleteWorkspace(workspaceId);
            if (res.data.success) {
                toast.success('Workspace deleted');
                router.push('/workspaces');
            } else {
                toast.error(res.data.message || 'Failed to delete workspace');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error deleting workspace');
        } finally {
            setIsDeletingWorkspace(false);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Danger Zone</h1>
                <p className={styles.description}>Destructive actions that cannot be undone.</p>
            </div>

            <div className={styles.section} style={{ border: '1px solid #fca5a5' }}>
                <div className={styles.sectionBody}>
                    <div className={styles.flexRow}>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Delete Account</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                Permanently remove your Personal Account and all of its contents from the Khaata Ledger platform. This action is not reversible.
                            </div>
                        </div>
                        <button 
                            className={styles.button + ' ' + styles.buttonDanger}
                            onClick={handleDeleteAccount}
                            disabled={isDeletingAccount}
                        >
                            {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>

                    {isOwner && (
                        <>
                            <hr style={{ border: 0, borderTop: '1px solid #fca5a5', margin: '0.5rem 0' }} />
                            <div className={styles.flexRow}>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Delete Workspace</div>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        Permanently delete this workspace and all associated data, employees, transactions, and customers.
                                    </div>
                                </div>
                                <button 
                                    className={styles.button + ' ' + styles.buttonDanger}
                                    onClick={handleDeleteWorkspace}
                                    disabled={isDeletingWorkspace}
                                >
                                    {isDeletingWorkspace ? 'Deleting...' : 'Delete Workspace'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
