const isClient = typeof window !== 'undefined';
const WORKSPACE_KEY = 'ledger_active_workspace';

let activeWorkspaceId: string | null = null;
const listeners = new Set<() => void>();

const initWorkspaceState = () => {
  if (!isClient) return;
  activeWorkspaceId = localStorage.getItem(WORKSPACE_KEY);
};

export const getWorkspaceId = (): string | null => {
  if (activeWorkspaceId === null && isClient) {
    initWorkspaceState();
  }
  return activeWorkspaceId;
};

export const setWorkspaceId = (id: string | null): void => {
  activeWorkspaceId = id;

  if (isClient) {
    if (id) {
      localStorage.setItem(WORKSPACE_KEY, id);
    } else {
      localStorage.removeItem(WORKSPACE_KEY);
    }
  }

  listeners.forEach((listener) => listener());
};

export const clearWorkspaceId = (): void => {
  setWorkspaceId(null);
};

export const subscribeToWorkspace = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Initialize immediately on load
if (isClient) {
  initWorkspaceState();
}
