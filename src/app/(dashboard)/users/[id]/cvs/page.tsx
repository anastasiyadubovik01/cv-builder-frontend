import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { CvsContent } from '@/features/cvs/components/CvsContent';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

type UserCvsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserCvsPage({ params }: UserCvsPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;
  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;

  const isAdmin = role === 'Admin';
  const isOwner = currentUserId === id;

  if (!isAdmin && !isOwner) {
    notFound();
  }

  return (
    <div className="pt-4">
      <CvsContent isAdmin={isAdmin} userId={id} />
    </div>
  );
}
