'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useForgotPasswordForm } from '@/app/(auth)/_components/hooks/useForgotPasswordForm';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { formData, errors, loading, handleChange, handleSubmit } =
    useForgotPasswordForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9" noValidate>
      <Input
        type="email"
        placeholder={t('auth.signIn.emailPlaceholder')}
        value={formData.email}
        onChange={handleChange('email')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.email ? t(errors.email) : undefined}
      />
      <div className="mt-[28px] flex flex-col items-center gap-2 font-medium">
        <Button type="submit" disabled={loading} className="w-[220px]">
          {t('auth.forgotPassword.button')}
        </Button>
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-[220px]')}
        >
          {t('auth.forgotPassword.cancel')}
        </Link>
      </div>
    </form>
  );
}
