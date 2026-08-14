import { cookies } from 'next/headers';

import { UserDetailsNavigation } from '@/features/users/components/details/UserDetailsNavigation';
import { getT } from 'next-i18next/server';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

type UserDetailsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailsLayout({
  children,
  params,
}: UserDetailsLayoutProps) {
  const { id } = await params;
  const { t } = await getT();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;

  const isOwner = currentUserId === id;

  const canViewCvs = role === 'Admin' || isOwner;

  return (
    <div className="min-h-screen">
      <UserDetailsNavigation
        userId={id}
        showCvs={canViewCvs}
        labels={{
          employees: t('users.title'),
          profile: t('users.details.tabs.profile'),
          skills: t('users.details.tabs.skills'),
          languages: t('users.details.tabs.languages'),
          cvs: t('users.details.tabs.cvs'),
        }}
      />

      <div className="px-5">{children}</div>
    </div>
  );
}
