'use client';

import { useT } from 'next-i18next/client';

import { ErrorState } from '@/components/layout/ErrorState';

type NoInternetErrorProps = {
  onRetry?: () => void;
};

export function NoInternetError({ onRetry }: NoInternetErrorProps) {
  const { t } = useT('common');

  // TODO: Заменить временную перезагрузку страницы на повтор failed GraphQL-запроса через refetch
  const handleRetry = onRetry ?? (() => window.location.reload());

  return (
    <ErrorState
      title={t('errors.noInternet.title')}
      description={
        <>
          {t('errors.noInternet.descriptionFirst')}
          <br />
          {t('errors.noInternet.descriptionSecond')}
        </>
      }
      actionLabel={t('retry')}
      onAction={handleRetry}
    />
  );
}
