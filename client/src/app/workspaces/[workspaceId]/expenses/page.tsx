import { TransactionsPage } from '../../../../views/TransactionsPage';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function ExpensesRoute({ params }: Props) {
    await params;

    return <TransactionsPage />;
}