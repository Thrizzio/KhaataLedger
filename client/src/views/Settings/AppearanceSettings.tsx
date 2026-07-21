'use client';

import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { getAuthState, setAuthData } from '../../store/authStore';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';

export const AppearanceSettings: React.FC = () => {
    const user = getAuthState().user;
    
    // Parse preferences
    const defaultPrefs = { theme: 'system', compactMode: false, reducedMotion: false, accentColor: 'blue' };
    const [preferences, setPreferences] = useState(defaultPrefs);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user && (user as any).preferences) {
            setPreferences({ ...defaultPrefs, ...(user as any).preferences });
        }
    }, [user]);

    const handleChange = (key: string, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await userService.updatePreferences(preferences);
            if (res.data.success) {
                toast.success('Appearance updated successfully');
                setHasChanges(false);
                const authState = getAuthState();
                if (authState.user) {
                    const updatedUser = { ...authState.user, preferences: res.data.data.preferences };
                    setAuthData(authState.token, updatedUser);
                }
            } else {
                toast.error('Failed to update appearance');
            }
        } catch (error: any) {
            toast.error('Error updating appearance');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Appearance</h1>
                <p className={styles.description}>Customize how Khaata Ledger looks on your device.</p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionBody}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Theme</label>
                        <select 
                            className={styles.input}
                            value={preferences.theme}
                            onChange={(e) => handleChange('theme', e.target.value)}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System Default</option>
                        </select>
                    </div>

                    <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                        <label className={styles.label}>Accent Color</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['blue', 'purple', 'green', 'orange', 'red'].map(color => (
                                <button
                                    key={color}
                                    style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        backgroundColor: color === 'blue' ? '#2563eb' : 
                                                        color === 'purple' ? '#9333ea' : 
                                                        color === 'green' ? '#16a34a' : 
                                                        color === 'orange' ? '#ea580c' : '#dc2626',
                                        border: preferences.accentColor === color ? '2px solid #111827' : '2px solid transparent',
                                        cursor: 'pointer',
                                        boxShadow: preferences.accentColor === color ? '0 0 0 2px white inset' : 'none'
                                    }}
                                    onClick={() => handleChange('accentColor', color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.flexRow} style={{ marginTop: '1rem' }}>
                        <div>
                            <div className={styles.label}>Compact Mode</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Display more data on screen with denser tables and lists.</div>
                        </div>
                        <div 
                            className={`${styles.toggleSwitch} ${preferences.compactMode ? styles.toggleSwitchActive : ''}`}
                            onClick={() => handleChange('compactMode', !preferences.compactMode)}
                        >
                            <div className={styles.toggleThumb} />
                        </div>
                    </div>

                    <div className={styles.flexRow} style={{ marginTop: '1rem' }}>
                        <div>
                            <div className={styles.label}>Reduced Motion</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Disable UI animations and transitions for better performance.</div>
                        </div>
                        <div 
                            className={`${styles.toggleSwitch} ${preferences.reducedMotion ? styles.toggleSwitchActive : ''}`}
                            onClick={() => handleChange('reducedMotion', !preferences.reducedMotion)}
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
                                setPreferences(user && (user as any).preferences ? { ...defaultPrefs, ...(user as any).preferences } : defaultPrefs);
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
