import { KhataDetailsPage } from '../../../../../views/KhataDetailsPage';

interface Props {
    params: Promise<{
        workspaceId: string;
        khataId: string;
    }>;
}

export default async function KhataDetailsRoute({ params }: Props) {
    const { workspaceId, khataId } = await params;
    return <KhataDetailsPage workspaceId={workspaceId} khataId={khataId} />;
}
