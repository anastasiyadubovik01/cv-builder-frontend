import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { UsersContent } from '@/features/users/components/UsersContent';
import { mockUsers } from '@/features/users/mock/users';

import { getT } from 'next-i18next/server';

export default async function UsersPage() {
  const { t } = await getT();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 ml-6 w-fit">
        <Breadcrumbs items={[{ label: t('users.title') }]} />
      </div>

      <UsersContent users={mockUsers} />
    </div>
  );
}
