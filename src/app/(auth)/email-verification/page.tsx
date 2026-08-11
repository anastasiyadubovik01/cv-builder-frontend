import type { Metadata } from 'next';
import Link from 'next/link';
import { getT } from 'next-i18next/server';
import { Button, buttonVariants } from '@/components/ui/button';
import { DigitsInputOTP } from '@/components/ui/digits-input-otp';
import { cn } from '@/lib/utils';

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

      <form className="flex flex-col gap-9">
        <div className="flex justify-center">
          <DigitsInputOTP />
        </div>
        <div className="mt-2 flex flex-col items-center gap-2 font-medium">
          <Button type="submit" className="w-[160px]">
            {t('auth.emailVerification.button')}
          </Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-[160px]')}
          >
            {t('auth.emailVerification.later')}
          </Link>
        </div>
      </form>
    </div>
  );
}
