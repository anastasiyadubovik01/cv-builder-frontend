import { cookies } from 'next/headers';

import { UserProfile } from '@/features/users/components/profile/UserProfile';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

type UserProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const role = accessToken ? getRoleFromJwt(accessToken) : null;

  const isOwner = currentUserId === id;
  const canEdit = role === 'Admin' || isOwner;

  return <UserProfile userId={id} canEdit={canEdit} isOwner={isOwner} />;
}
