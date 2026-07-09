import { EmployeesPage } from '../../../../views/EmployeesPage';

interface Props {
    params: { workspaceId: string };
}

export default function EmployeesRoute({ params }: Props) {
    return <EmployeesPage workspaceId={params.workspaceId} />;
}
