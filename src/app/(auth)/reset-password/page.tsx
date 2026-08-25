import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { ResetPasswordForm } from '@/app/(auth)/_components/ResetPasswordForm';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  return {
    title: `${t('auth.resetPassword.title')} | CV Builder`,
    description: t('auth.resetPassword.description'),
  };
}

export default async function ResetPasswordPage() {
  const { t } = await getT();

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center text-foreground">
        <h1 className="mb-5 text-[34px] font-regular">
          {t('auth.resetPassword.heading')}
        </h1>
        <p className="text-[16px]">{t('auth.resetPassword.subheading')}</p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
