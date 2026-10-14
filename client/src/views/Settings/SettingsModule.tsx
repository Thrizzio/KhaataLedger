'use client';

import React, { useState } from 'react';
import styles from './Settings.module.css';
import { ProfileSettings } from './ProfileSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { SecuritySettings } from './SecuritySettings';
import { NotificationSettings } from './NotificationSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { DangerZone } from './DangerZone';

import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import WarningIcon from '@mui/icons-material/Warning';

interface SettingsModuleProps {
    workspaceId: string;
}

type TabType = 'profile' | 'workspace' | 'security' | 'notifications' | 'appearance' | 'danger';

export const SettingsModule: React.FC<SettingsModuleProps> = ({ workspaceId }) => {
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings />;
            case 'workspace':
                return <WorkspaceSettings workspaceId={workspaceId} />;
            case 'security':
                return <SecuritySettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'danger':
                return <DangerZone workspaceId={workspaceId} />;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <nav className={styles.nav} aria-label="Settings sections">
                    <button
                        type="button"
                        className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
                        aria-current={activeTab === 'profile' ? 'page' : undefined}
                        onClick={() => setActiveTab('profile')}
                    >
                        <PersonIcon fontSize="small" />
                        Profile
                    </button>
                    <button
                        type="button"
                        className={`${styles.navItem} ${activeTab === 'workspace' ? styles.navItemActive : ''}`}
                        aria-current={activeTab === 'workspace' ? 'page' : undefined}
                        onClick={() => setActiveTab('workspace')}
                    >
                        <WorkIcon fontSize="small" />
                        Workspace
                    </button>
                    <button
                        type="button"
                        className={`${styles.navItem} ${activeTab === 'security' ? styles.navItemActive : ''}`}
                        aria-current={activeTab === 'security' ? 'page' : undefined}
                        onClick={() => setActiveTab('security')}
                    >
                        <SecurityIcon fontSize="small" />
                        Security
                    </button>
                    <button
                        type="button"
                        className={`${styles.navItem} ${activeTab === 'notifications' ? styles.navItemActive : ''}`}
                        aria-current={activeTab === 'notifications' ? 'page' : undefined}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <NotificationsIcon fontSize="small" />
                        Notifications
                    </button>
                    <button
                        type="button"
                        className={`${styles.navItem} ${activeTab === 'appearance' ? styles.navItemActive : ''}`}
                        aria-current={activeTab === 'appearance' ? 'page' : undefined}
                        onClick={() => setActiveTab('appearance')}
                    >
                        <PaletteIcon fontSize="small" />
                        Appearance
                    </button>
                    <button
                        type="button"
                        className={`${styles.navItem} ${styles.navItemDanger} ${activeTab === 'danger' ? styles.navItemDangerActive : ''}`}
                        aria-current={activeTab === 'danger' ? 'page' : undefined}
                        onClick={() => setActiveTab('danger')}
                    >
                        <WarningIcon fontSize="small" />
                        Danger Zone
                    </button>
                </nav>
            </aside>
            
            <main className={styles.content}>
                {renderContent()}
            </main>
        </div>
    );
};
