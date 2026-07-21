'use client';

import React, { useEffect, useState } from 'react';
import styles from './Settings.module.css';
import { getAuthState, setAuthData } from '../../store/authStore';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';
import type { AuthUser } from '../../types/auth';

export const ProfileSettings: React.FC = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const authState = getAuthState();
        if (authState.user) {
            setUser(authState.user);
            setFormData({ name: authState.user.name, email: authState.user.email });
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFormData = { ...formData, [e.target.name]: e.target.value };
        setFormData(newFormData);
        
        if (user && (newFormData.name !== user.name || newFormData.email !== user.email)) {
            setHasChanges(true);
        } else {
            setHasChanges(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await userService.updateProfile(formData);
            if (res.data.success && res.data.data) {
                const authState = getAuthState();
                setAuthData(authState.token, res.data.data);
                setUser(res.data.data);
                setHasChanges(false);
                toast.success('Profile updated successfully');
            } else {
                toast.error(res.data.message || 'Failed to update profile');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <p>Loading profile...</p>;

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Profile Settings</h1>
                <p className={styles.description}>Manage your personal information and how you appear across the application.</p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionBody}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f3f4f6', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                            color: '#9ca3af', border: '1px solid #e5e7eb'
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <button className={styles.button + ' ' + styles.buttonSecondary}>
                            Upload new picture
                        </button>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className={styles.input}
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className={styles.input}
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div className={styles.inputGroup} style={{ flex: 1 }}>
                            <label className={styles.label}>Role</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={user.role}
                                disabled
                            />
                        </div>
                        {user.employeeId && (
                            <div className={styles.inputGroup} style={{ flex: 1 }}>
                                <label className={styles.label}>Employee ID</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={user.employeeId}
                                    disabled
                                />
                            </div>
                        )}
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
                                setFormData({ name: user.name, email: user.email });
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
