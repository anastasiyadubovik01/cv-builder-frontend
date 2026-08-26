import { LOGIN_MUTATION } from '@/api/auth';
import { SignInFormValues, signInSchema } from '@/lib/validations/auth';
import { useAuthForm } from './useAuthForm';

interface LoginMutationData {
  login: {
    access_token: string;
    refresh_token: string;
  };
}

const INITIAL_VALUES: SignInFormValues = {
  email: '',
  password: '',
};

export function useSignInForm() {
  return useAuthForm<SignInFormValues, LoginMutationData>({
    initialValues: INITIAL_VALUES,
    schema: signInSchema,
    mutation: LOGIN_MUTATION,
    getTokens: (data) => data?.login,
    redirectTo: '/',
    errorContext: 'SignIn error',
  });
}
