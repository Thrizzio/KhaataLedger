import { InventoryPage } from '../../../../views/InventoryPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspaceInventoryRoute({ params }: Props) {
    const { workspaceId } = await params;

    return <InventoryPage workspaceId={workspaceId} />;
}
