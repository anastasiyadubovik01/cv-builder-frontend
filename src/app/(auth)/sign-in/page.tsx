import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { AuthTabs } from '../_components/AuthTabs';
import { SignInForm } from '@/app/(auth)/_components/SignInForm';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();

  return {
    title: `${t('auth.signIn.title')} | CV Builder`,
    description: t('auth.signIn.description'),
  };
}

export default async function SignInPage() {
  const { t } = await getT();

  return (
    <>
      <AuthTabs />
      <div className="flex flex-col">
        <div className="mb-10 text-center text-foreground">
          <h1 className="mb-5 text-[34px] font-regular">
            {t('auth.signIn.heading')}
          </h1>
          <p className="text-[16px]">{t('auth.signIn.subheading')}</p>
        </div>
        <SignInForm />
      </div>
    </>
  );
}
