import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { Permission } from '../types/auth';
import { workspaceService } from '../services/workspace.service';

export const usePermission = () => {
  const { user } = useAuth();

  const { data: employeeData } = useQuery({
    queryKey: ['employee', user?.id],
    queryFn: () => workspaceService.getEmployee(user?.workspaceId as string, user?.id as string).then(res => {
        if (!res.data.data) throw new Error('Employee not found');
        return res.data.data;
    }),
    enabled: !!user && user.role === 'EMPLOYEE' && !!user.workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 30, // 30 seconds polling for immediate-ish updates
  });

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    if (user.role === 'OWNER') return true;
    
    // Fall back to login permissions if query is loading or failed
    const permissions = employeeData?.permissions ?? user.permissions ?? [];
    return permissions.includes(permission);
  };

  return { hasPermission };
};
