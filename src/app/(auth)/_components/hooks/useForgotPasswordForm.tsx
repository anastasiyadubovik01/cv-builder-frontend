import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { toast } from '@/components/ui/sonner';
import { FORGOT_PASSWORD_MUTATION } from '@/api/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '@/lib/validations/auth';
import { useValidatedForm } from '@/app/(auth)/_components/hooks/useValidatedForm';

const INITIAL_VALUES: ForgotPasswordFormValues = {
  email: '',
};

export function useForgotPasswordForm() {
  const { t } = useTranslation();

  const { formData, errors, setErrors, validateForm, handleChange } =
    useValidatedForm<ForgotPasswordFormValues>({
      initialValues: INITIAL_VALUES,
      schema: forgotPasswordSchema,
    });

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION, {
    onCompleted: () => {
      toast.success(t('auth.forgotPassword.successMessage'));
    },
  });

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
      handleFormError(err, {
        t,
        fieldErrorKeys: ['auth.errors.userNotFound'],
        setFieldError: (translationKey) => {
          setErrors({ email: translationKey });
        },
        context: 'ForgotPassword error',
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
