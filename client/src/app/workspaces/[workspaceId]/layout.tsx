"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { WorkspaceDashboardLayout } from "../../../layouts/WorkspaceDashboardLayout";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const params = useParams<{ workspaceId: string }>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (!params) {
    return null;
  }

  return (
    <WorkspaceDashboardLayout workspaceId={params.workspaceId}>
      {children}
    </WorkspaceDashboardLayout>
  );
}