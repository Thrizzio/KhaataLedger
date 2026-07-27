import { CustomerDetailPage } from '../../../../../views/CustomerDetailPage';

interface Props {
    params: Promise<{
        workspaceId: string;
        customerId: string;
    }>;
}

export default async function WorkspaceCustomerDetailRoute({ params }: Props) {
    const { workspaceId, customerId } = await params;
    return <CustomerDetailPage workspaceId={workspaceId} customerId={customerId} />;
}
