'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { SIGN_UP_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SignUpForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [signup, { loading, error }] = useMutation(SIGN_UP_MUTATION, {
    onCompleted: async (data) => {
      if (data?.signup?.access_token && data?.signup?.refresh_token) {
        await setAuthCookies({
          accessToken: data.signup.access_token,
          refreshToken: data.signup.refresh_token,
        });
        router.push('/');
        router.refresh();
      }
    },
  });

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await signup({
        variables: {
          auth: { email, password, confirmPassword },
        },
      });
    } catch (err) {
      console.error('SignUp error:', err);
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
      <PasswordInput
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full bg-transparent p-3 text-[16px]"
        required
      />
      {displayError && (
        <p className="text-center text-sm text-destructive">{displayError}</p>
      )}
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
