'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSignInForm } from '@/app/(auth)/_components/hooks/useSignInForm';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SignInForm() {
  const { t } = useTranslation();
  const { formData, errors, loading, handleChange, handleBlur, handleSubmit } =
    useSignInForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9" noValidate>
      <Input
        type="email"
        placeholder={t('auth.signIn.emailPlaceholder')}
        value={formData.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.email && t(errors.email)}
      />
      <PasswordInput
        type="password"
        placeholder={t('auth.signIn.passwordPlaceholder')}
        value={formData.password}
        onChange={handleChange('password')}
        onBlur={handleBlur('password')}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.password && t(errors.password)}
      />
      <div className="mt-2 flex flex-col items-center gap-2 font-medium">
        <Button type="submit" disabled={loading} className="w-[220px]">
          {t('auth.signIn.button')}
        </Button>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ variant: 'ghost' }), 'w-[220px]')}
        >
          {t('auth.signIn.forgotPassword')}
        </Link>
      </div>
    </form>
  );
}
