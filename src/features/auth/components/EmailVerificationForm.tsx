'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useEmailVerificationForm } from '@/features/auth/hooks/useEmailVerificationForm';
import { Button, buttonVariants } from '@/components/ui/button';
import { DigitsInputOTP } from '@/components/ui/digits-input-otp';
import { cn } from '@/lib/utils';

export function EmailVerificationForm() {
  const { t } = useTranslation();
  const { otp, error, loading, handleOtpChange, handleSubmit } =
    useEmailVerificationForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9">
      <DigitsInputOTP
        value={otp}
        onChange={handleOtpChange}
        disabled={loading}
        error={error ? t(error) : undefined}
      />
      <div className="mt-2 flex flex-col items-center gap-2 font-medium">
        <Button type="submit" disabled={loading} className="w-[160px]">
          {t('auth.emailVerification.button')}
        </Button>
        <Link
          href="/public"
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-[160px]')}
        >
          {t('auth.emailVerification.later')}
        </Link>
      </div>
    </form>
  );
}
