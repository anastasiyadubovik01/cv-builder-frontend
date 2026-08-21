import React from 'react';
import { getT } from 'next-i18next/server';
import { CvDetailsNavigation } from '@/features/cvs/components/details/CvDetailsNavigation';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getRoleFromJwt, getUserIdFromJwt } from '@/lib/helpers/jwt';
import { CV_QUERY } from '@/api/cvs';
import { getClient } from '@/lib/apollo/client';

type CvDetailsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export default async function CvDetailsLayout({
  children,
  params,
}: CvDetailsLayoutProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/auth/login');
  }

  const currentUserId = getUserIdFromJwt(accessToken);
  const role = getRoleFromJwt(accessToken);
  const isAdmin = role === 'Admin';

  if (!isAdmin) {
    try {
      const { data } = await getClient().query({
        query: CV_QUERY,
        variables: {
          cvId: id,
        },
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      });

      const cvOwnerId = data?.cv?.user?.id;

      if (!cvOwnerId || cvOwnerId !== currentUserId) {
        notFound();
      }
    } catch {
      notFound();
    }
  }

  const { t } = await getT();

  return (
    <div className="min-h-screen">
      <CvDetailsNavigation
        cvId={id}
        labels={{
          cvs: t('cvs.title', 'CVs'),
          details: t('cvs.tabs.details', 'Details'),
          skills: t('cvs.tabs.skills', 'Skills'),
          projects: t('cvs.tabs.projects', 'Projects'),
          preview: t('cvs.tabs.preview', 'Preview'),
        }}
      />

      <div className="px-5">{children}</div>
    </div>
  );
}
