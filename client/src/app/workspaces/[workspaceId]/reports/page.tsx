import { PageShell } from '../../../../views/PageShell';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function ReportsRoute({ params }: Props) {
    await params;

    return (
        <PageShell
            title="Reports"
            description="Ledger reports and export workflows for this workspace."
        />
    );
}