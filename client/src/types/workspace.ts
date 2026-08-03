export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    employeeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: 'EMPLOYEE';
    employeeId: string | null;
    workspaceId: string | null;
    permissions: string[];
    createdAt: string;
}

export interface CreateEmployeePayload {
    name: string;
    email: string;
    password: string;
    permissions?: string[];
}
