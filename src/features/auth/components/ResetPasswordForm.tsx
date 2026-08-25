'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useResetPasswordForm } from '@/features/auth/hooks/useResetPasswordForm';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ResetPasswordForm() {
  const { t } = useTranslation();
  const { formData, errors, loading, handleChange, handleSubmit } =
    useResetPasswordForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9" noValidate>
      <PasswordInput
        type="password"
        placeholder={t('auth.signUp.passwordPlaceholder')}
        value={formData.newPassword}
        onChange={handleChange('newPassword')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.newPassword ? t(errors.newPassword) : undefined}
      />
      <PasswordInput
        type="password"
        placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.confirmPassword ? t(errors.confirmPassword) : undefined}
      />
      <div className="mt-2 flex flex-col items-center gap-2 font-medium">
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[120px] w-full max-w-[180px]"
        >
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
  );
}
