import type { Metadata } from 'next';
import Link from 'next/link';
import { getT } from 'next-i18next/server';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

      <form className="flex flex-col gap-9">
        <Input
          type="email"
          placeholder="Email"
          className="w-full bg-transparent p-3 text-[16px]"
          required
        />
        <div className="mt-[28px] flex flex-col items-center gap-2 font-medium">
          <Button type="submit" className="w-[220px]">
            {t('auth.forgotPassword.button')}
          </Button>
          <Link href="/sign-in" className="w-[220px]">
            <Button variant="ghost" className="w-full">
              {t('auth.forgotPassword.cancel')}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
