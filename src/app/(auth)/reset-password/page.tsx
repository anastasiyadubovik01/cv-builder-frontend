import type { Metadata } from 'next';
import Link from 'next/link';
import { getT } from 'next-i18next/server';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

      <form className="flex flex-col gap-9">
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
          <Button type="submit" className="min-w-[120px] w-full max-w-[180px]">
            {t('auth.resetPassword.button')}
          </Button>
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'min-w-[120px] w-full max-w-[180px]',
            )}
          >
            {t('auth.resetPassword.goToSignIn')}
          </Link>
        </div>
      </form>
    </div>
  );
}
