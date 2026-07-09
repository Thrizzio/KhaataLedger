import { TransactionsPage } from '../../../../views/TransactionsPage';

interface Props {
    params: { workspaceId: string };
}

export default function ExpensesRoute({ params: _params }: Props) {
    return <TransactionsPage />;
}
