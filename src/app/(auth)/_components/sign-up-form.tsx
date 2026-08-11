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
import { z } from 'zod';
import { toast } from '@/components/ui/sonner';

const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Confirm Password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const errorMessages: Record<string, string> = {
  userAlreadyExists: 'An account with this email already exists',
  failedToSendEmail: 'Failed to send verification email',
};

export function SignUpForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpFormValues, string>>
  >({});

  const [signup, { loading }] = useMutation(SIGN_UP_MUTATION, {
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
    setErrors({});

    const result = signUpSchema.safeParse({
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof SignUpFormValues;
        if (path) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await signup({
        variables: {
          auth: { email, password, confirmPassword },
        },
      });
    } catch (err: unknown) {
      let userFriendlyMessage = 'Something went wrong. Please try again later';

      if (err instanceof Error) {
        const message = err.message;

        for (const [key, value] of Object.entries(errorMessages)) {
          if (message.toLowerCase().includes(key.toLowerCase())) {
            userFriendlyMessage = value;
            break;
          }
        }
      }

      toast.error(userFriendlyMessage);
      console.error('SignUp error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9" noValidate>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.email}
      />
      <PasswordInput
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.password}
      />
      <PasswordInput
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full bg-transparent p-3 text-[16px]"
        required
        error={errors.confirmPassword}
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
