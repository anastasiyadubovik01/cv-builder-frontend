import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import { SignInFormValues, signInSchema } from '@/lib/validations/auth';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';

const INITIAL_VALUES: SignInFormValues = {
  email: '',
  password: '',
};

export function useSignInForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<SignInFormValues>({
      initialValues: INITIAL_VALUES,
      schema: signInSchema,
    });

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

  const handleChange =
    (field: keyof SignInFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Валидируем при вводе только если форма уже отправлялась или поле содержало ошибку
      setFieldValue(field, e.target.value, { shouldValidate: isSubmitted });
    };

  const handleBlur = (field: keyof SignInFormValues) => () => {
    validateField(field);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

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
    handleBlur,
    handleSubmit,
  };
}
