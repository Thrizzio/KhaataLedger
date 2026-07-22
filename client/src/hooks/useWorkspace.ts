import { useSyncExternalStore } from 'react';
import { getWorkspaceId, subscribeToWorkspace, setWorkspaceId, clearWorkspaceId } from '../store/workspaceStore';

export const useWorkspace = () => {
  const workspaceId = useSyncExternalStore(subscribeToWorkspace, getWorkspaceId, () => null);

  return {
    workspaceId,
    setWorkspaceId,
    clearWorkspaceId,
  };
};
