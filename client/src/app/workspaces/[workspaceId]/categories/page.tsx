import { PageShell } from '../../../../views/PageShell';

interface Props {
    params: Promise<{
        workspaceId: string;
    }>;
}

export default async function CategoriesRoute({ params }: Props) {
    const { workspaceId } = await params;

    return (
        <PageShell
            title="Categories"
            description="Manage expense and income categories for this workspace."
        />
    );
}