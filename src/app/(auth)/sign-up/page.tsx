import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { AuthTabs } from '../_components/auth-tabs';
import { SignUpForm } from '@/app/(auth)/_components/sign-up-form';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  return {
    title: `${t('auth.signUp.title')} | CV Builder`,
    description: t('auth.signUp.description'),
  };
}

export default async function SignUpPage() {
  const { t } = await getT();

  return (
    <>
      <AuthTabs />
      <div className="flex flex-col">
        <div className="mb-10 text-center text-foreground">
          <h1 className="mb-5 text-[34px] font-regular">
            {t('auth.signUp.heading')}
          </h1>
          <p className="text-[16px]">{t('auth.signUp.subheading')}</p>
        </div>
        <SignUpForm />
      </div>
    </>
  );
}
