import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { toast } from '@/components/ui/sonner';
import { RESET_PASSWORD_MUTATION, LOGIN_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/lib/validations/auth';
import { getEmailFromJwt } from '@/lib/helpers/jwt';

export function useResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');

  const [formData, setFormData] = useState<ResetPasswordFormValues>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordFormValues, string>>
  >({});

  const [resetPassword, { loading: resetLoading }] = useMutation(
    RESET_PASSWORD_MUTATION,
  );
  const [signIn, { loading: signInLoading }] = useMutation(LOGIN_MUTATION);

  const validateForm = (): boolean => {
    const result = resetPasswordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof ResetPasswordFormValues, string>
      > = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof ResetPasswordFormValues;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange =
    (field: keyof ResetPasswordFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!resetToken) {
      toast.error(t('auth.errors.expiredResetToken'));
      return;
    }

    try {
      await resetPassword({
        variables: {
          auth: {
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          },
        },
        context: {
          headers: {
            authorization: `Bearer ${resetToken}`,
          },
        },
      });

      const userEmail = getEmailFromJwt(resetToken);

      if (userEmail) {
        const signInResult = await signIn({
          variables: {
            auth: {
              email: userEmail,
              password: formData.newPassword,
            },
          },
        });

        const tokens = signInResult.data?.login;

        if (tokens?.access_token && tokens?.refresh_token) {
          await setAuthCookies({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          });

          toast.success(t('auth.resetPassword.successMessage'));
          router.push('/');
          router.refresh();
          return;
        }
      }

      toast.success(t('auth.resetPassword.successMessage'));
      router.push('/sign-in');
    } catch (err: unknown) {
      handleFormError(err, {
        t,
        context: 'ResetPassword error',
      });
    }
  };

  return {
    formData,
    errors,
    loading: resetLoading || signInLoading,
    handleChange,
    handleSubmit,
  };
}
