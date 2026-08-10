import type { Metadata } from 'next';
import { getT } from 'next-i18next/server';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { AuthTabs } from '../_components/auth-tabs';
import { cn } from '@/lib/utils';

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
          <PasswordInput
            type="password"
            placeholder="Confirm Password"
            className="w-full bg-transparent p-3 text-[16px]"
            required
          />
          <div className="mt-2 flex flex-col items-center gap-2 font-medium">
            <Button type="submit" className="w-[220px]">
              {t('auth.signUp.button')}
            </Button>
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ variant: 'ghost' }), 'w-[220px]')}
            >
              {t('auth.signUp.haveAccount')}
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
