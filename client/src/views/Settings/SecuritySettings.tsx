'use client';

import React, { useState } from 'react';
import styles from './Settings.module.css';
import { userService } from '../../services/user.service';
import { toast } from 'react-hot-toast';

export const SecuritySettings: React.FC = () => {
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    // Simple password strength calculation
    const getStrength = (password: string) => {
        if (!password) return 0;
        let score = 0;
        if (password.length > 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    };

    const strength = getStrength(formData.newPassword);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (strength < 2) {
            toast.error('Please choose a stronger password');
            return;
        }

        setIsSaving(true);
        try {
            const res = await userService.updatePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            if (res.data.success) {
                toast.success('Password updated successfully');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(res.data.message || 'Failed to update password');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error updating password');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Security Settings</h1>
                <p className={styles.description}>Manage your password and secure your account.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className={styles.section}>
                <div className={styles.sectionBody}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Change Password</h3>
                    
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            className={styles.input}
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            className={styles.input}
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                        {formData.newPassword && (
                            <div style={{ marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} style={{ 
                                            flex: 1, 
                                            backgroundColor: i < strength ? strengthColors[strength] : '#e5e7eb',
                                            borderRadius: '2px',
                                            transition: 'background-color 0.2s ease'
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: strengthColors[strength], fontWeight: 500 }}>
                                    {strengthLabels[strength]}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={styles.input}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className={styles.sectionFooter}>
                    <button 
                        type="submit" 
                        className={styles.button + ' ' + styles.buttonPrimary}
                        disabled={isSaving || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    >
                        {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};
