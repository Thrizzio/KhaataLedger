import { PaymentsPage } from '../../../../views/PaymentsPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspacePaymentsRoute({ params }: Props) {
    const { workspaceId } = await params;
    return <PaymentsPage workspaceId={workspaceId} />;
}
