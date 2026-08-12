import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { ForgotPasswordForm } from '@/app/(auth)/_components/forgot-password-form';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  return {
    title: `${t('auth.forgotPassword.title')} | CV Builder`,
    description: t('auth.forgotPassword.description'),
  };
}

export default async function ForgotPasswordPage() {
  const { t } = await getT();

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center text-foreground">
        <h1 className="mb-5 text-[34px] font-regular">
          {t('auth.forgotPassword.heading')}
        </h1>
        <p className="text-[16px]">{t('auth.forgotPassword.subheading')}</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
