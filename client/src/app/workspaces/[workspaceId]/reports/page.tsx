import { ReportsPage } from '../../../../features/reports/ReportsPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspaceReportsRoute({ params }: Props) {
    const { workspaceId } = await params;

    return <ReportsPage workspaceId={workspaceId} />;
}
