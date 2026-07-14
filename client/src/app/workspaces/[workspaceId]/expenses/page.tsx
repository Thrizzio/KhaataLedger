import { TransactionsPage } from '../../../../views/TransactionsPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function ExpensesRoute({ params }: Props) {
    const { workspaceId } = await params;
    return <TransactionsPage workspaceId={workspaceId} />;
}