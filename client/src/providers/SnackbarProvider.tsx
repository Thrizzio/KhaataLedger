"use client";

import { useState, useEffect, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { subscribeSnackbar, type SnackbarEvent, type SnackbarSeverity } from "../lib/snackbar";

const AUTO_HIDE_MS = 4000;

interface SnackState {
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
}

const DEFAULT_STATE: SnackState = {
    open: false,
    message: "",
    severity: "info",
};

/**
 * Renders a single MUI Snackbar + Alert that is driven by the
 * framework-agnostic `showSnackbar()` event bus (src/lib/snackbar.ts).
 * Mount exactly once — inside AppProviders.
 */
export function SnackbarProvider() {
    const [state, setState] = useState<SnackState>(DEFAULT_STATE);

    const handleEvent = useCallback((event: SnackbarEvent) => {
        setState({
            open: true,
            message: event.message,
            severity: event.severity ?? "info",
        });
    }, []);

    useEffect(() => {
        return subscribeSnackbar(handleEvent);
    }, [handleEvent]);

    const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === "clickaway") return;
        setState((prev) => ({ ...prev, open: false }));
    };

    return (
        <Snackbar
            open={state.open}
            autoHideDuration={AUTO_HIDE_MS}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
            {/* Alert must always be rendered (not null) so MUI can animate it */}
            <Alert
                onClose={handleClose}
                severity={state.severity}
                variant="filled"
                sx={{
                    minWidth: 300,
                    maxWidth: 480,
                    fontSize: "0.875rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
            >
                {state.message}
            </Alert>
        </Snackbar>
    );
}
