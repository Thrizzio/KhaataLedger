import { ReportsPage } from '../../../../views/ReportsPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function ReportsRoute({ params }: Props) {
    const { workspaceId } = await params;

    return <ReportsPage workspaceId={workspaceId} />;
}