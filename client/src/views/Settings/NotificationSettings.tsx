'use client';

import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { getAuthState, setAuthData } from '../../store/authStore';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';

export const NotificationSettings: React.FC = () => {
    const user = getAuthState().user;
    
    // Default preferences
    const defaultPrefs = { 
        emailNotifications: true, 
        transactionAlerts: true, 
        employeeActivity: false, 
        auditLogAlerts: false, 
        workspaceUpdates: true 
    };
    
    const [preferences, setPreferences] = useState(defaultPrefs);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user && (user as any).preferences && (user as any).preferences.notifications) {
            setPreferences({ ...defaultPrefs, ...(user as any).preferences.notifications });
        }
    }, [user]);

    const handleChange = (key: string, value: boolean) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // merge with existing preferences so we don't overwrite appearance
            const currentPrefs = user && (user as any).preferences ? (user as any).preferences : {};
            const newPrefs = { ...currentPrefs, notifications: preferences };

            const res = await userService.updatePreferences(newPrefs);
            if (res.data.success) {
                toast.success('Notification settings updated');
                setHasChanges(false);
                const authState = getAuthState();
                if (authState.user) {
                    const updatedUser = { ...authState.user, preferences: res.data.data.preferences };
                    setAuthData(authState.token, updatedUser);
                }
            } else {
                toast.error('Failed to update notifications');
            }
        } catch (error: any) {
            toast.error('Error updating notifications');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Notifications</h1>
                <p className={styles.description}>Manage how and when you receive notifications.</p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionBody}>
                    <div className={styles.flexRow}>
                        <div>
                            <div className={styles.label}>Email Notifications</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Receive daily summaries and important updates via email.</div>
                        </div>
                        <div 
                            className={`${styles.toggleSwitch} ${preferences.emailNotifications ? styles.toggleSwitchActive : ''}`}
                            onClick={() => handleChange('emailNotifications', !preferences.emailNotifications)}
                        >
                            <div className={styles.toggleThumb} />
                        </div>
                    </div>

                    <hr style={{ border: 0, borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />

                    <div className={styles.flexRow}>
                        <div>
                            <div className={styles.label}>Transaction Alerts</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Get notified when a new transaction is created or modified.</div>
                        </div>
                        <div 
                            className={`${styles.toggleSwitch} ${preferences.transactionAlerts ? styles.toggleSwitchActive : ''}`}
                            onClick={() => handleChange('transactionAlerts', !preferences.transactionAlerts)}
                        >
                            <div className={styles.toggleThumb} />
                        </div>
                    </div>

                    <div className={styles.flexRow} style={{ marginTop: '1rem' }}>
                        <div>
                            <div className={styles.label}>Employee Activity</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Alerts for when employees join, leave, or update their profile.</div>
                        </div>
                        <div 
                            className={`${styles.toggleSwitch} ${preferences.employeeActivity ? styles.toggleSwitchActive : ''}`}
                            onClick={() => handleChange('employeeActivity', !preferences.employeeActivity)}
                        >
                            <div className={styles.toggleThumb} />
                        </div>
                    </div>

                    <div className={styles.flexRow} style={{ marginTop: '1rem' }}>
                        <div>
                            <div className={styles.label}>Audit Log Alerts</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Receive alerts for destructive actions like deletions.</div>
                        </div>
                        <div 
                            className={`${styles.toggleSwitch} ${preferences.auditLogAlerts ? styles.toggleSwitchActive : ''}`}
                            onClick={() => handleChange('auditLogAlerts', !preferences.auditLogAlerts)}
                        >
                            <div className={styles.toggleThumb} />
                        </div>
                    </div>

                    <div className={styles.flexRow} style={{ marginTop: '1rem' }}>
                        <div>
                            <div className={styles.label}>Workspace Updates</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Notifications regarding your workspace settings and limits.</div>
                        </div>
                        <div 
                            className={`${styles.toggleSwitch} ${preferences.workspaceUpdates ? styles.toggleSwitchActive : ''}`}
                            onClick={() => handleChange('workspaceUpdates', !preferences.workspaceUpdates)}
                        >
                            <div className={styles.toggleThumb} />
                        </div>
                    </div>
                </div>
            </div>

            {hasChanges && (
                <div className={styles.saveBar}>
                    <span className={styles.saveBarText}>You have unsaved changes</span>
                    <div className={styles.saveBarActions}>
                        <button 
                            className={styles.saveBarButton + ' ' + styles.saveBarButtonSecondary}
                            onClick={() => {
                                setPreferences(user && (user as any).preferences && (user as any).preferences.notifications ? { ...defaultPrefs, ...(user as any).preferences.notifications } : defaultPrefs);
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
