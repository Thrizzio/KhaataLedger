import { DashboardPage } from '../../../../views/DashboardPage';

interface Props {
    params: { workspaceId: string };
}

export default function WorkspaceDashboardRoute({ params }: Props) {
    return <DashboardPage workspaceId={params.workspaceId} />;
}
