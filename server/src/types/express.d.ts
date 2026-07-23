import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      workspaceId?: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
