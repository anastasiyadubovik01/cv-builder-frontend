import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CvsContent } from '@/features/cvs/components/CvsContent';

import { getT } from 'next-i18next/server';

export default async function CvsPage() {
  const { t } = await getT();

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs items={[{ label: t('cvs.title', 'CVs') }]} />
        </div>
      </div>

      <CvsContent />
    </div>
  );
}
