import { PageShell } from '../../../../views/PageShell';

interface Props {
    params: { workspaceId: string };
}

export default function ReportsRoute({ params: _params }: Props) {
    return (
        <PageShell
            title="Reports"
            description="Ledger reports and export workflows for this workspace."
        />
    );
}
