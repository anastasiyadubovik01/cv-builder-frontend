import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { RESET_PASSWORD_MUTATION, LOGIN_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/lib/validations/auth';
import { getEmailFromJwt } from '@/lib/helpers/jwt';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';

const INITIAL_VALUES: ResetPasswordFormValues = {
  newPassword: '',
  confirmPassword: '',
};

export function useResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token');
  const toast = useToast();

  const { formData, errors, validateForm, handleChange } =
    useValidatedForm<ResetPasswordFormValues>({
      initialValues: INITIAL_VALUES,
      schema: resetPasswordSchema,
    });

  const [resetPassword, { loading: resetLoading }] = useMutation(
    RESET_PASSWORD_MUTATION,
  );

  const [signIn, { loading: signInLoading }] = useMutation(LOGIN_MUTATION);

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
