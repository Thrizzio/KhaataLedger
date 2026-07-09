import { DashboardPage } from '../../../../views/DashboardPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspaceDashboardRoute({ params }: Props) {
    const { workspaceId } = await params;

    return <DashboardPage workspaceId={workspaceId} />;
}