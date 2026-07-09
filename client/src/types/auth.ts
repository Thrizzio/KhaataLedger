export type UserRole = 'OWNER' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId?: string | null;
}
