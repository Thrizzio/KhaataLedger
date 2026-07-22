"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { WorkspaceDashboardLayout } from "../../../layouts/WorkspaceDashboardLayout";
import { workspaceService } from "../../../services/workspace.service";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params?.workspaceId ?? "";
  const { setWorkspaceId, clearWorkspaceId } = useWorkspace();

  // Reuses the cache populated by WorkspaceDashboardLayout; errors (403/404) mean
  // the caller does not own / is not a member of this workspace.
  const { isError, isSuccess } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspaceById(workspaceId).then((r) => r.data.data),
    enabled: isAuthenticated && Boolean(workspaceId),
    retry: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!workspaceId) return;

    // Employees may only view the single workspace they belong to.
    if (
      user?.role === "EMPLOYEE" &&
      user.workspaceId &&
      user.workspaceId !== workspaceId
    ) {
      router.replace(`/workspaces/${user.workspaceId}/dashboard`);
      return;
    }

    // Owners may only view workspaces they own (server enforces; mirror here).
    if (user?.role === "OWNER") {
      if (isError) {
        // If workspace is invalid/deleted/404, clear state and go to root to auto-recover
        clearWorkspaceId();
        router.replace("/");
        return;
      } else if (isSuccess) {
        // Valid workspace found, sync to store
        setWorkspaceId(workspaceId);
      }
    }
  }, [isAuthenticated, user, workspaceId, isError, isSuccess, router, clearWorkspaceId, setWorkspaceId]);

  if (!isAuthenticated || !params || !workspaceId) {
    return null;
  }
  if (user?.role === "OWNER" && isError) {
    return null;
  }

  return (
    <WorkspaceDashboardLayout workspaceId={workspaceId}>
      {children}
    </WorkspaceDashboardLayout>
  );
}
