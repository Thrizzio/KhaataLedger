import { SupplierDetailPage } from '../../../../../views/SupplierDetailPage';

interface Props {
    params: Promise<{
        workspaceId: string;
        supplierId: string;
    }>;
}

export default async function WorkspaceSupplierDetailRoute({ params }: Props) {
    const { workspaceId, supplierId } = await params;
    return <SupplierDetailPage workspaceId={workspaceId} supplierId={supplierId} />;
}
