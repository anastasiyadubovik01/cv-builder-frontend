import { describe, expect, it, vi } from 'vitest';

import { LOGIN_MUTATION } from '@/api/auth';
import { signInSchema } from '@/lib/validations/auth';

import { useAuthForm } from './useAuthForm';
import { useSignInForm } from './useSignInForm';

vi.mock('./useAuthForm', () => ({
  useAuthForm: vi.fn(),
}));

describe('useSignInForm', () => {
  it('configures auth form for sign in', () => {
    const authFormResult = {
      formData: {
        email: '',
        password: '',
      },
      errors: {},
      loading: false,
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
      handleSubmit: vi.fn(),
    };

    vi.mocked(useAuthForm).mockReturnValue(authFormResult as never);

    const result = useSignInForm();

    expect(useAuthForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: {
          email: '',
          password: '',
        },
        schema: signInSchema,
        mutation: LOGIN_MUTATION,
        redirectTo: '/',
        errorContext: 'SignIn error',
      }),
    );

    expect(result).toBe(authFormResult);
  });

  it('extracts tokens from login response', () => {
    vi.mocked(useAuthForm).mockReturnValue({} as never);

    useSignInForm();

    const config = vi.mocked(useAuthForm).mock.calls[0][0];

    const tokens = config.getTokens({
      login: {
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
