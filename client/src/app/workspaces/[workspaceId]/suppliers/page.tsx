import { SuppliersPage } from '../../../../views/SuppliersPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspaceSuppliersRoute({ params }: Props) {
    const { workspaceId } = await params;
    return <SuppliersPage workspaceId={workspaceId} />;
}
