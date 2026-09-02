import { describe, expect, it, vi } from 'vitest';

import { SIGN_UP_MUTATION } from '@/api/auth';
import { signUpSchema } from '@/lib/validations/auth';

import { useAuthForm } from './useAuthForm';
import { useSignUpForm } from './useSignUpForm';

vi.mock('./useAuthForm', () => ({
  useAuthForm: vi.fn(),
}));

describe('useSignUpForm', () => {
  it('configures auth form for sign up', () => {
    const authFormResult = {
      formData: {
        email: '',
        password: '',
        confirmPassword: '',
      },
      errors: {},
      loading: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    };

    vi.mocked(useAuthForm).mockReturnValue(authFormResult as never);

    const result = useSignUpForm();

    expect(useAuthForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: {
          email: '',
          password: '',
          confirmPassword: '',
        },
        schema: signUpSchema,
        mutation: SIGN_UP_MUTATION,
        redirectTo: '/verify-email',
        errorContext: 'SignUp error',
      }),
    );

    expect(result).toBe(authFormResult);
  });

  it('extracts tokens from signup response', () => {
    vi.mocked(useAuthForm).mockReturnValue({} as never);

    useSignUpForm();

    const config = vi.mocked(useAuthForm).mock.calls[0][0];

    const tokens = config.getTokens({
      signup: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      },
    });

    expect(tokens).toEqual({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });
});
