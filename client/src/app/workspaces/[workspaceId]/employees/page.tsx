import { EmployeesPage } from '../../../../views/EmployeesPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function EmployeesRoute({ params }: Props) {
    const { workspaceId } = await params;

    return <EmployeesPage workspaceId={workspaceId} />;
}