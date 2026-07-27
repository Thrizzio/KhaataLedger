import { SalesPage } from '../../../../views/SalesPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspaceSalesRoute({ params }: Props) {
    const { workspaceId } = await params;
    return <SalesPage workspaceId={workspaceId} />;
}
