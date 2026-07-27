import { PurchasesPage } from '../../../../views/PurchasesPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspacePurchasesRoute({ params }: Props) {
    const { workspaceId } = await params;
    return <PurchasesPage workspaceId={workspaceId} />;
}
