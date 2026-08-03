import { PageShell } from './PageShell';
import { Permission } from '../types/auth';
import { usePermission } from '../hooks/usePermission';
import { UnauthorizedView } from '../components/UnauthorizedView';

export const SettingsPage = () => {
  const { hasPermission } = usePermission();

  if (!hasPermission(Permission.SETTINGS_VIEW)) {
      return (
          <PageShell>
              <UnauthorizedView />
          </PageShell>
      );
  }

  return (
    <PageShell
      description="Organization, profile, and security settings will be added here."
      title="Settings"
    />
  );
};
