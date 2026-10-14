"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { ReactNode } from "react";
import { PageHeader } from "../shared/components/PageHeader";

interface PageShellProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  /** Pass the current workspace so the modal can scope new transactions correctly */
  workspaceId?: string;
}

export const PageShell = ({ title, description, children, workspaceId = '' }: PageShellProps) => {
  return (
    <Box component="section" data-workspace-id={workspaceId || undefined}>
      <Stack spacing={{ xs: 2.5, md: 3.5 }}>
        {title && <PageHeader title={title} subtitle={description} />}
        {children}
      </Stack>
    </Box>
  );
};
