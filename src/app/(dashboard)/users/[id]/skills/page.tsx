import { cookies } from 'next/headers';

import { UserSkillsContent } from '@/features/users/components/UserSkillsContent';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

type UserSkillsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserSkillsPage({ params }: UserSkillsPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const role = accessToken ? getRoleFromJwt(accessToken) : null;

  const canManage = role === 'Admin' || currentUserId === id;

  return <UserSkillsContent userId={id} canManage={canManage} />;
}
