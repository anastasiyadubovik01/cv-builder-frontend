'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SignInForm() {
  const { t } = useTranslation();

  return (
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
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-[160px]')}
        >
          {t('auth.signIn.forgotPassword')}
        </Link>
      </div>
    </form>
  );
}
