import { PageShell } from '../../../../views/PageShell';

interface Props {
    params: { workspaceId: string };
}

export default function CategoriesRoute({ params: _params }: Props) {
    return (
        <PageShell
            title="Categories"
            description="Manage expense and income categories for this workspace."
        />
    );
}
