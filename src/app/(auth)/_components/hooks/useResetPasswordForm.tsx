import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { toast } from '@/components/ui/sonner';
import { RESET_PASSWORD_MUTATION } from '@/api/auth';
import { mapServerError } from '@/lib/helpers/errorMapper';
import {
  ResetPasswordFormValues,
  resetPasswordSchema,
} from '@/lib/validations/auth';

export function useResetPasswordForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [formData, setFormData] = useState<ResetPasswordFormValues>({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordFormValues, string>>
  >({});

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION, {
    onCompleted: () => {
      // authenticate?
      router.push('/');
      router.refresh();
    },
  });

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

    if (!validateForm()) {
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
      });
    } catch (err: unknown) {
      const translationKey = mapServerError(err);
      toast.error(t(translationKey));
      console.error('ResetPassword error:', err);
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
