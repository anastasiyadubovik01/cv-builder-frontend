'use client';

import { useT } from 'next-i18next/client';

import { ErrorState } from '@/components/layout/ErrorState';

type DeviceGuardProps = {
  children: React.ReactNode;
};

export function DeviceGuard({ children }: DeviceGuardProps) {
  const { t } = useT('common');

  return (
    <>
      <div className="md:hidden">
        <ErrorState
          title={t('errors.device.title')}
          description={
            <>
              {t('errors.device.descriptionFirst')}
              <br />
              {t('errors.device.descriptionSecond')}
            </>
          }
        />
      </div>

      <div className="hidden md:block">{children}</div>
    </>
  );
}
