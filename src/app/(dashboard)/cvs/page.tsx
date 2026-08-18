import { cookies } from 'next/headers';
import { getT } from 'next-i18next/server';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CvsContent } from '@/features/cvs/components/CvsContent';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

export default async function CvsPage() {
  const { t } = await getT();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;
  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const isAdmin = role === 'Admin';

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs items={[{ label: t('cvs.title', 'CVs') }]} />
        </div>
      </div>

      <CvsContent
        isAdmin={isAdmin}
        currentUserId={currentUserId ?? undefined}
      />
    </div>
  );
}
