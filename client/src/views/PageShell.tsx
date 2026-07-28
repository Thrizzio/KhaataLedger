"use client";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ReactNode } from "react";

interface PageShellProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  /** Pass the current workspace so the modal can scope new transactions correctly */
  workspaceId?: string;
}

export const PageShell = ({ title, description, children, workspaceId = '' }: PageShellProps) => {

  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {title && (
            <Typography variant="h4" fontWeight={700}>
              {title}
            </Typography>
          )}

        </Stack>

        {description && (
          <Paper sx={{ p: 3 }} variant="outlined">
            <Typography color="text.secondary">
              {description}
            </Typography>
          </Paper>
        )}

        {children}
      </Stack>

    </>
  );
};