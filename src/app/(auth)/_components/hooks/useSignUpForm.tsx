import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { toast } from '@/components/ui/sonner';
import { SIGN_UP_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';

import { mapServerError } from '@/lib/helpers/errorMapper';
import { SignUpFormValues, signUpSchema } from '@/lib/validations/auth';

export function useSignUpForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
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

  const validateForm = (): boolean => {
    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as keyof SignUpFormValues;
        if (path) {
          // Используем i18n ключи из схемы
          fieldErrors[path] = t(issue.message);
        }
      }
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange =
    (field: keyof SignUpFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Очищаем ошибку при изменении поля
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
      await signup({
        variables: {
          auth: formData,
        },
      });
    } catch (err: unknown) {
      const translationKey = mapServerError(err);
      toast.error(t(translationKey));
      console.error('SignUp error:', err);
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
