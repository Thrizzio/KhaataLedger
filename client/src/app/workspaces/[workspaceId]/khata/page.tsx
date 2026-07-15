import { KhataPage } from '../../../../views/KhataPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function KhataRoute({ params }: Props) {
    const { workspaceId } = await params;
    return <KhataPage workspaceId={workspaceId} />;
}
