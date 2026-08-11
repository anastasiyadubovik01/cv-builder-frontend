'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSignUpForm } from '@/app/(auth)/_components/hooks/useSignUpForm';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SignUpForm() {
  const { t } = useTranslation();
  const { formData, errors, loading, handleChange, handleSubmit } =
    useSignUpForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9" noValidate>
      <Input
        type="email"
        placeholder={t('auth.signUp.emailPlaceholder')}
        value={formData.email}
        onChange={handleChange('email')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.email && t(errors.email)}
      />
      <PasswordInput
        type="password"
        placeholder={t('auth.signUp.passwordPlaceholder')}
        value={formData.password}
        onChange={handleChange('password')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.password && t(errors.password)}
      />
      <PasswordInput
        type="password"
        placeholder={t('auth.signUp.confirmPasswordPlaceholder')}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.confirmPassword && t(errors.confirmPassword)}
      />
      <div className="mt-2 flex flex-col items-center gap-2 font-medium">
        <Button type="submit" disabled={loading} className="w-[220px]">
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
  );
}
