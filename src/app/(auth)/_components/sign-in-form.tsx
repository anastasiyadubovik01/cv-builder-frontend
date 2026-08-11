'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SignInForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [login, { loading, error }] = useMutation(LOGIN_MUTATION, {
    onCompleted: async (data) => {
      if (data?.login?.access_token && data?.login?.refresh_token) {
        await setAuthCookies({
          accessToken: data.login.access_token,
          refreshToken: data.login.refresh_token,
        });
        router.push('/');
        router.refresh();
      }
    },
  });

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      await login({
        variables: {
          auth: { email, password },
        },
      });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const displayError = validationError || error?.message;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-transparent p-3 text-[16px]"
        required
      />
      <PasswordInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-transparent p-3 text-[16px]"
        required
      />
      {displayError && (
        <p className="text-center text-sm text-destructive">{displayError}</p>
      )}
      <div className="mt-2 flex flex-col items-center gap-2 font-medium">
        <Button type="submit" disabled={loading} className="w-[160px]">
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
