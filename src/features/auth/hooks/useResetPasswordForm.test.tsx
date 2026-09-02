import type { SyntheticEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LOGIN_MUTATION, RESET_PASSWORD_MUTATION } from '@/api/auth';
import { setAuthCookies } from '@/app/actions/auth';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { getEmailFromJwt } from '@/lib/helpers/jwt';
import { resetPasswordSchema } from '@/lib/validations/auth';

import { useResetPasswordForm } from './useResetPasswordForm';

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/app/actions/auth', () => ({
  setAuthCookies: vi.fn(),
}));

vi.mock('@/components/hooks/useValidatedForm', () => ({
  useValidatedForm: vi.fn(),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn(),
}));

vi.mock('@/lib/helpers/jwt', () => ({
  getEmailFromJwt: vi.fn(),
}));

describe('useResetPasswordForm', () => {
  const push = vi.fn();
  const refresh = vi.fn();
  const searchParamsGet = vi.fn();

  const resetPassword = vi.fn();
  const signIn = vi.fn();

  const validateForm = vi.fn();
  const handleChange = vi.fn();

  const toastError = vi.fn();
  const toastSuccess = vi.fn();

  const t = vi.fn((key: string) => key);

  const formData = {
    newPassword: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push,
      refresh,
    } as never);

    vi.mocked(useSearchParams).mockReturnValue({
      get: searchParamsGet,
    } as never);

    searchParamsGet.mockReturnValue('reset-token');

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useToast).mockReturnValue({
      error: toastError,
      success: toastSuccess,
    } as never);

    vi.mocked(useValidatedForm).mockReturnValue({
      formData,
      errors: {},
      validateForm,
      handleChange,
    } as never);

    validateForm.mockReturnValue(true);

    vi.mocked(useMutation).mockImplementation((mutation) => {
      if (mutation === RESET_PASSWORD_MUTATION) {
        return [
          resetPassword,
          {
            loading: false,
          },
        ] as never;
      }

      if (mutation === LOGIN_MUTATION) {
        return [
          signIn,
          {
            loading: false,
          },
        ] as never;
      }

      throw new Error('Unexpected mutation');
    });

    resetPassword.mockResolvedValue({
      data: {},
    });

    signIn.mockResolvedValue({
      data: {
        login: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      },
    });

    vi.mocked(getEmailFromJwt).mockReturnValue('test@example.com');

    vi.mocked(setAuthCookies).mockResolvedValue(undefined);
  });

  it('configures form and auth mutations', () => {
    renderHook(() => useResetPasswordForm());

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: {
        newPassword: '',
        confirmPassword: '',
      },
      schema: resetPasswordSchema,
    });

    expect(useMutation).toHaveBeenCalledWith(RESET_PASSWORD_MUTATION);

    expect(useMutation).toHaveBeenCalledWith(LOGIN_MUTATION);
  });

  it('does not submit when form validation fails', async () => {
    validateForm.mockReturnValue(false);

    const { result } = renderHook(() => useResetPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(validateForm).toHaveBeenCalledTimes(1);

    expect(resetPassword).not.toHaveBeenCalled();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('shows error when reset token is missing', async () => {
    searchParamsGet.mockReturnValue(null);

    const { result } = renderHook(() => useResetPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(toastError).toHaveBeenCalledWith('auth.errors.expiredResetToken');

    expect(resetPassword).not.toHaveBeenCalled();
  });

  it('resets password using token from URL', async () => {
    const { result } = renderHook(() => useResetPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(resetPassword).toHaveBeenCalledWith({
      variables: {
        auth: {
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        },
      },
      context: {
        headers: {
          authorization: 'Bearer reset-token',
        },
      },
    });
  });

  it('signs user in automatically after password reset', async () => {
    const { result } = renderHook(() => useResetPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(getEmailFromJwt).toHaveBeenCalledWith('reset-token');

    expect(signIn).toHaveBeenCalledWith({
      variables: {
        auth: {
          email: 'test@example.com',
          password: 'NewPassword123!',
        },
      },
    });

    expect(setAuthCookies).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(toastSuccess).toHaveBeenCalledWith(
      'auth.resetPassword.successMessage',
    );

    expect(push).toHaveBeenCalledWith('/');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('redirects to sign-in when email cannot be extracted from token', async () => {
    vi.mocked(getEmailFromJwt).mockReturnValue(null);

    const { result } = renderHook(() => useResetPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(signIn).not.toHaveBeenCalled();
    expect(setAuthCookies).not.toHaveBeenCalled();

    expect(toastSuccess).toHaveBeenCalledWith(
      'auth.resetPassword.successMessage',
    );

    expect(push).toHaveBeenCalledWith('/sign-in');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('redirects to sign-in when automatic login does not return tokens', async () => {
    signIn.mockResolvedValue({
      data: {
        login: null,
      },
    });

    const { result } = renderHook(() => useResetPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(setAuthCookies).not.toHaveBeenCalled();

    expect(toastSuccess).toHaveBeenCalledWith(
      'auth.resetPassword.successMessage',
    );

    expect(push).toHaveBeenCalledWith('/sign-in');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('handles submit error', async () => {
    const error = new Error('Reset failed');

    resetPassword.mockRejectedValue(error);

    const { result } = renderHook(() => useResetPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'ResetPassword error',
    });

    expect(push).not.toHaveBeenCalled();
  });

  it('returns form state and loading state', () => {
    vi.mocked(useMutation).mockImplementation((mutation) => {
      if (mutation === RESET_PASSWORD_MUTATION) {
        return [
          resetPassword,
          {
            loading: false,
          },
        ] as never;
      }

      return [
        signIn,
        {
          loading: true,
        },
      ] as never;
    });

    vi.mocked(useValidatedForm).mockReturnValue({
      formData,
      errors: {
        newPassword: 'Invalid password',
      },
      validateForm,
      handleChange,
    } as never);

    const { result } = renderHook(() => useResetPasswordForm());

    expect(result.current.formData).toBe(formData);

    expect(result.current.errors).toEqual({
      newPassword: 'Invalid password',
    });

    expect(result.current.handleChange).toBe(handleChange);

    expect(result.current.loading).toBe(true);
  });
});
