import type { Metadata } from 'next';
import Link from 'next/link';
import { getT } from 'next-i18next/server';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { AuthTabs } from '../_components/auth-tabs';

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

        <form className="flex flex-col gap-9">
          <Input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent p-3 text-[16px]"
            required
          />
          <PasswordInput
            type="password"
            placeholder="Password"
            className="w-full bg-transparent p-3 text-[16px]"
            required
          />
          <div className="mt-2 flex flex-col items-center gap-2 font-medium">
            <Button type="submit" className="w-[160px]">
              {t('auth.signIn.button')}
            </Button>
            <Link href="/forgot-password" className="w-[160px]">
              <Button variant="ghost" className="w-full">
                {t('auth.signIn.forgotPassword')}
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
