import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { handleFormError } from '@/lib/helpers/errorHandler';
import { SignInFormValues, signInSchema } from '@/lib/validations/auth';

export function useSignInForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState<SignInFormValues>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInFormValues, string>>
  >({});

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
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

  const validateForm = (): boolean => {
    const result = signInSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignInFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof SignInFormValues;
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
    (field: keyof SignInFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login({
        variables: {
          auth: formData,
        },
      });
    } catch (err: unknown) {
      handleFormError(err, {
        t,
        context: 'SignIn error',
      });
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
  };
}
