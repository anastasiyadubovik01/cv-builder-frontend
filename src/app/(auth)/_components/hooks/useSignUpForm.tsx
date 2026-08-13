import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { SIGN_UP_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import { SignUpFormValues, signUpSchema } from '@/lib/validations/auth';
import { useValidatedForm } from '@/app/(auth)/_components/hooks/useValidatedForm';

const INITIAL_VALUES: SignUpFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

export function useSignUpForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const { formData, errors, validateForm, handleChange } =
    useValidatedForm<SignUpFormValues>({
      initialValues: INITIAL_VALUES,
      schema: signUpSchema,
    });

  const [signup, { loading }] = useMutation(SIGN_UP_MUTATION, {
    onCompleted: async (data) => {
      if (data?.signup?.access_token && data?.signup?.refresh_token) {
        await setAuthCookies({
          accessToken: data.signup.access_token,
          refreshToken: data.signup.refresh_token,
        });
        router.push('/verify-email');
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
      await signup({
        variables: {
          auth: formData,
        },
      });
    } catch (err: unknown) {
      handleFormError(err, {
        t,
        context: 'SignUp error',
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
