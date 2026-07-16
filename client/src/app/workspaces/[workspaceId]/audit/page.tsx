import { AuditPage } from '../../../../views/AuditPage';

interface Props {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceAuditRoute({ params }: Props) {
  const { workspaceId } = await params;
  return <AuditPage workspaceId={workspaceId} />;
}
