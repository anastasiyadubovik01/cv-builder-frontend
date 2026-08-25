import { SIGN_UP_MUTATION } from '@/api/auth';
import { SignUpFormValues, signUpSchema } from '@/lib/validations/auth';
import { useAuthForm } from './useAuthForm';

interface SignUpMutationData {
  signup: {
    access_token: string;
    refresh_token: string;
  };
}

const INITIAL_VALUES: SignUpFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

export function useSignUpForm() {
  return useAuthForm<SignUpFormValues, SignUpMutationData>({
    initialValues: INITIAL_VALUES,
    schema: signUpSchema,
    mutation: SIGN_UP_MUTATION,
    getTokens: (data) => data?.signup,
    redirectTo: '/verify-email',
    errorContext: 'SignUp error',
  });
}
