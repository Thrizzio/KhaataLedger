/**
 * Tiny event-bus for global snackbar notifications.
 * Framework-agnostic: can be called from Axios interceptors,
 * TanStack Query mutation handlers, or any module.
 *
 * Usage:
 *   import { showSnackbar } from '@/lib/snackbar';
 *   showSnackbar({ message: 'Saved!', severity: 'success' });
 */

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarEvent {
    message: string;
    severity?: SnackbarSeverity;
}

type Listener = (event: SnackbarEvent) => void;

const listeners = new Set<Listener>();

export function showSnackbar(event: SnackbarEvent): void {
    listeners.forEach((fn) => fn(event));
}

export function subscribeSnackbar(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
