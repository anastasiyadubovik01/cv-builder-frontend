import { getT } from 'next-i18next/server';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SettingsContent } from '@/features/settings/components/SettingsContent';

export default async function SettingsPage() {
  const { t } = await getT();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs
            items={[
              {
                label: t('settings.title', 'Settings'),
              },
            ]}
          />
        </div>
      </div>

      <SettingsContent />
    </div>
  );
}
