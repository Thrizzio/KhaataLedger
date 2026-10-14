"use client";

import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { appTheme } from "../theme/theme";
import { SnackbarProvider } from "./SnackbarProvider";
import { showSnackbar } from "../lib/snackbar";
import { ApiError, getApiErrorDetails } from "../api/apiError";

// ── QueryClient — created once at module level so it survives re-renders ───────
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 2 * 60 * 1000,   // 2 min — data is fresh for 2 minutes
            gcTime: 10 * 60 * 1000,     // 10 min — keep unused data in memory
            retry: (failureCount, error) => {
                const status = (error as ApiError)?.status;
                // Never retry auth or permission errors
                if (status === 401 || status === 403) return false;
                return failureCount < 1;
            },
            refetchOnWindowFocus: false,
        },
        mutations: {
            // The Axios interceptor presents API failures once. Keep this
            // fallback for non-HTTP failures only so mutations do not produce
            // duplicate toasts.
            onError: (error: unknown) => {
                if (error instanceof ApiError) return;
                const msg = getApiErrorDetails(error, "An unexpected error occurred.").message;
                showSnackbar({ message: msg, severity: "error" });
            },
        },
    },
});

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * Single composition root for all providers.
 * Order matters:
 *   QueryClientProvider → ThemeProvider → CssBaseline → SnackbarProvider → children
 *
 * Adding a new provider in future: wrap it here, nowhere else.
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={appTheme}>
                <CssBaseline />
                <SnackbarProvider />
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    );
}
