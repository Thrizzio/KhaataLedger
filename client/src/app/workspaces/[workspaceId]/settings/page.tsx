import { PageShell } from '../../../../views/PageShell';

interface Props {
    params: { workspaceId: string };
}

export default function SettingsRoute({ params: _params }: Props) {
    return (
        <PageShell
            title="Settings"
            description="Workspace profile and security settings."
        />
    );
}
