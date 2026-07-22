import { PageShell } from '../../../../views/PageShell';
import { SettingsModule } from '../../../../views/Settings/SettingsModule';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function SettingsRoute({ params }: Props) {
    const { workspaceId } = await params;

    return (
        <PageShell title="Settings">
            <SettingsModule workspaceId={workspaceId} />
        </PageShell>
    );
}