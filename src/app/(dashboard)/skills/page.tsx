import { cookies } from 'next/headers';
import { getT } from 'next-i18next/server';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { AdminSkillsContent } from '@/features/skills/components/AdminSkillsContent';
import { UserSkillsContent } from '@/features/users/components/UserSkillsContent';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

export default async function SkillsPage() {
  const { t } = await getT();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;
  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;

  const content =
    role === 'Admin' ? (
      <AdminSkillsContent />
    ) : currentUserId ? (
      <UserSkillsContent userId={currentUserId} canManage />
    ) : null;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs items={[{ label: t('sidebar.skills') }]} />
        </div>
      </div>

      {content}
    </div>
  );
}
