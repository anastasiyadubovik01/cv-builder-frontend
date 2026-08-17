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

  const { formData, errors, validateForm, handleChange } =
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
