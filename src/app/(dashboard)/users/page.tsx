import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { UsersContent } from '@/features/users/components/UsersContent';

import { getT } from 'next-i18next/server';

export default async function UsersPage() {
  const { t } = await getT();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs items={[{ label: t('users.title') }]} />
        </div>
      </div>

      <UsersContent />
    </div>
  );
}
