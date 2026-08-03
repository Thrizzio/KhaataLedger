import { EmployeeDetailsPage } from '../../../../../views/EmployeeDetailsPage';

interface PageProps {
    params: Promise<{
        workspaceId: string;
        employeeId: string;
    }>;
}

export default async function EmployeeDetailsRoute({ params }: PageProps) {
    const resolvedParams = await params;
    return <EmployeeDetailsPage workspaceId={resolvedParams.workspaceId} employeeId={resolvedParams.employeeId} />;
}
