import { CustomersPage } from '../../../../views/CustomersPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function WorkspaceCustomersRoute({ params }: Props) {
    const { workspaceId } = await params;
    return <CustomersPage workspaceId={workspaceId} />;
}
