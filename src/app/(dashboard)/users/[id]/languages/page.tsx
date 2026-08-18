import { cookies } from 'next/headers';

import { UserLanguagesContent } from '@/features/users/components/UserLanguagesContent';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

type UserLanguagesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserLanguagesPage({
  params,
}: UserLanguagesPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const role = accessToken ? getRoleFromJwt(accessToken) : null;

  const canManage = role === 'Admin' || currentUserId === id;

  return <UserLanguagesContent userId={id} canManage={canManage} />;
}
