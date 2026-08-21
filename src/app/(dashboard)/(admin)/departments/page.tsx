import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getT } from 'next-i18next/server';

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { DepartmentsContent } from '@/features/departments/components/DepartmentsContent';
import { getRoleFromJwt } from '@/lib/helpers/jwt';

export default async function DepartmentsPage() {
  const { t } = await getT();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const role = accessToken ? getRoleFromJwt(accessToken) : null;

  if (role !== 'Admin') {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs
            items={[{ label: t('departments.title', 'Departments') }]}
          />
        </div>
      </div>

      <DepartmentsContent />
    </div>
  );
}
