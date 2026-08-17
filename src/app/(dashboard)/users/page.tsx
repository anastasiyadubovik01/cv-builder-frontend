import { cookies } from 'next/headers';
import { getT } from 'next-i18next/server';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { UsersContent } from '@/features/users/components/UsersContent';
import { getRoleFromJwt } from '@/lib/helpers/jwt';

export default async function UsersPage() {
  const { t } = await getT();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;
  const isAdmin = role === 'Admin';

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs items={[{ label: t('users.title') }]} />
        </div>
      </div>

      <UsersContent isAdmin={isAdmin} />
    </div>
  );
}
