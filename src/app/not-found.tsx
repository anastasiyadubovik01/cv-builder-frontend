'use client';

import { useRouter } from 'next/navigation';
import { useT } from 'next-i18next/client';

import { ErrorState } from '@/components/layout/ErrorState';

export default function NotFound() {
  const router = useRouter();
  const { t } = useT('common');

  return (
    <ErrorState
      title={t('errors.notFound.title')}
      description={
        <>
          {t('errors.notFound.descriptionFirst')}
          <br />
          {t('errors.notFound.descriptionSecond')}
        </>
      }
      actionLabel={t('errors.notFound.goBack')}
      onAction={() => router.back()}
    />
  );
}
