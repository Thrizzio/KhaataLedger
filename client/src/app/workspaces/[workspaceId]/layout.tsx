"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { WorkspaceDashboardLayout } from '../../../layouts/WorkspaceDashboardLayout';

interface WorkspaceLayoutProps {
    children: ReactNode;
    params: { workspaceId: string };
}

export default function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace(`/login`);
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <WorkspaceDashboardLayout workspaceId={params.workspaceId}>
            {children}
        </WorkspaceDashboardLayout>
    );
}
