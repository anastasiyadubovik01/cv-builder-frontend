'use client';

import type React from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { CHANGE_PASSWORD_MUTATION } from '@/api/auth';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/lib/validations/settings';

const initialValues: ChangePasswordFormValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function useChangePasswordForm() {
  const { t } = useTranslation();
  const toast = useToast();

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    validateField,
    setFieldValue,
    clearErrors,
  } = useValidatedForm<ChangePasswordFormValues>({
    initialValues,
    schema: changePasswordSchema,
  });

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION);

  const isValid = changePasswordSchema.safeParse(formData).success;

  const handleChange =
    (field: keyof ChangePasswordFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFieldValue(field, event.target.value);
    };

  const handleBlur = (field: keyof ChangePasswordFormValues) => () => {
    validateField(field);
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      await changePassword({
        variables: {
          args: formData,
        },
      });

      setFormData(initialValues);
      clearErrors();

      toast.success(t('settings.notifications.passwordChanged'));
    } catch (error: unknown) {
      handleFormError(error, {
        t,
        fieldErrorKeys: [
          'settings.validation.currentPasswordIncorrect',
          'settings.validation.samePassword',
          'settings.validation.passwordsDoNotMatch',
        ],
        setFieldError: (translationKey) => {
          if (
            translationKey === 'settings.validation.currentPasswordIncorrect'
          ) {
            setErrors((prev) => ({
              ...prev,
              oldPassword: translationKey,
            }));

            return;
          }

          if (translationKey === 'settings.validation.samePassword') {
            setErrors((prev) => ({
              ...prev,
              newPassword: translationKey,
            }));

            return;
          }

          if (translationKey === 'settings.validation.passwordsDoNotMatch') {
            setErrors((prev) => ({
              ...prev,
              confirmPassword: translationKey,
            }));
          }
        },
        context: 'Change password',
      });
    }
  };

  return {
    formData,
    errors,
    loading,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
