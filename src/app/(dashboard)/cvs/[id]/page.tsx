import { cookies } from 'next/headers';

import { CvDetails } from '@/features/cvs/components/details/CvDetails';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';

type CvDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CvDetailsPage({ params }: CvDetailsPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const currentUserId = accessToken ? getUserIdFromJwt(accessToken) : null;
  const role = accessToken ? getRoleFromJwt(accessToken) : null;

  return (
    <CvDetails
      cvId={id}
      currentUserId={currentUserId}
      isAdmin={role === 'Admin'}
    />
  );
}
