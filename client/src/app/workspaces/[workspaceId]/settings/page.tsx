import { PageShell } from '../../../../views/PageShell';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function SettingsRoute({ params }: Props) {
    await params;

    return (
        <PageShell
            title="Settings"
            description="Workspace profile and security settings."
        />
    );
}