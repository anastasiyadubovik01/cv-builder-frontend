import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { toast } from '@/components/ui/sonner';
import { FORGOT_PASSWORD_MUTATION } from '@/api/auth';
import { mapServerError } from '@/lib/helpers/errorMapper';
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '@/lib/validations/auth';

export function useForgotPasswordForm() {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<ForgotPasswordFormValues>({
    email: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormValues, string>>
  >({});

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION, {
    onCompleted: () => {
      toast.success(t('auth.forgotPassword.successMessage'));
    },
  });

  const validateForm = (): boolean => {
    const result = forgotPasswordSchema.safeParse(formData);

    if (!result.success) {
      const issue = result.error.issues[0];
      if (issue) {
        setErrors({ email: issue.message });
      }
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange =
    (field: keyof ForgotPasswordFormValues) =>
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
      await forgotPassword({
        variables: {
          auth: formData,
        },
      });
    } catch (err: unknown) {
      const translationKey = mapServerError(err);

      if (translationKey === 'auth.errors.userNotFound') {
        setErrors({ email: translationKey });
      } else {
        toast.error(t(translationKey));
      }
      console.error('ForgotPassword error:', err);
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
