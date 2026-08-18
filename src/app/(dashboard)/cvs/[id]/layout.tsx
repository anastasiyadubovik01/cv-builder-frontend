import React from 'react';
import { getT } from 'next-i18next/server';
import { CvDetailsNavigation } from '@/features/cvs/components/details/CvDetailsNavigation';

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
