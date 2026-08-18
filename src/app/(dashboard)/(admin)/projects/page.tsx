import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getT } from 'next-i18next/server';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProjectsContent } from '@/features/projects/components/ProjectsContent';
import { getRoleFromJwt } from '@/lib/helpers/jwt';

export default async function ProjectsPage() {
  const { t } = await getT();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;
  const isAdmin = role === 'Admin';

  if (!isAdmin) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs items={[{ label: t('projects.title', 'Projects') }]} />
        </div>
      </div>

      <ProjectsContent />
    </div>
  );
}
