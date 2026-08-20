import { getT } from 'next-i18next/server';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CvProjectsContent } from '@/features/cvs/components/CvProjectsContent';

interface CvProjectsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CvProjectsPage({ params }: CvProjectsPageProps) {
  const { id } = await params;
  const { t } = await getT();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs
            items={[
              { label: t('cvs.title', 'CVs'), href: '/cvs' },
              { label: t('projects.title', 'Projects') },
            ]}
          />
        </div>
      </div>

      <CvProjectsContent cvId={id} />
    </div>
  );
}
