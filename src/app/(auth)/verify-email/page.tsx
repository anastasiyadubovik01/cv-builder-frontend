import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { EmailVerificationForm } from '@/app/(auth)/_components/email-verification-form';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  return {
    title: `${t('auth.emailVerification.title')} | CV Builder`,
    description: t('auth.emailVerification.description'),
  };
}

export default async function EmailVerificationPage() {
  const { t } = await getT();

  return (
    <div className="flex flex-col">
      <div className="mb-10 text-center text-foreground">
        <h1 className="mb-5 text-[34px] font-regular">
          {t('auth.emailVerification.heading')}
        </h1>
        <p className="text-[16px]">{t('auth.emailVerification.subheading')}</p>
      </div>
      <EmailVerificationForm />
    </div>
  );
}
