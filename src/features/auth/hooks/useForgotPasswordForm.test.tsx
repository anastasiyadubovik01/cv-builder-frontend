import type { SyntheticEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FORGOT_PASSWORD_MUTATION } from '@/api/auth';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { forgotPasswordSchema } from '@/lib/validations/auth';

import { useForgotPasswordForm } from './useForgotPasswordForm';

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
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

describe('useForgotPasswordForm', () => {
  const forgotPassword = vi.fn();

  const validateForm = vi.fn();
  const handleChange = vi.fn();
  const setErrors = vi.fn();

  const toastSuccess = vi.fn();

  const t = vi.fn((key: string) => key);

  const formData = {
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useToast).mockReturnValue({
      success: toastSuccess,
    } as never);

    vi.mocked(useValidatedForm).mockReturnValue({
      formData,
      errors: {},
      setErrors,
      validateForm,
      handleChange,
    } as never);

    validateForm.mockReturnValue(true);

    vi.mocked(useMutation).mockReturnValue([
      forgotPassword,
      {
        loading: false,
      },
    ] as never);

    forgotPassword.mockResolvedValue({
      data: {},
    });
  });

  it('configures validated form and forgot password mutation', () => {
    renderHook(() => useForgotPasswordForm());

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: {
        email: '',
      },
      schema: forgotPasswordSchema,
    });

    expect(useMutation).toHaveBeenCalledWith(
      FORGOT_PASSWORD_MUTATION,
      expect.objectContaining({
        onCompleted: expect.any(Function),
      }),
    );
  });

  it('does not submit when form validation fails', async () => {
    validateForm.mockReturnValue(false);

    const { result } = renderHook(() => useForgotPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(validateForm).toHaveBeenCalledTimes(1);

    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it('submits email when form is valid', async () => {
    const { result } = renderHook(() => useForgotPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(forgotPassword).toHaveBeenCalledWith({
      variables: {
        auth: formData,
      },
    });
  });

  it('shows success toast after completed mutation', async () => {
    renderHook(() => useForgotPasswordForm());

    const mutationOptions = vi.mocked(useMutation).mock.calls[0][1] as {
      onCompleted?: () => void;
    };

    act(() => {
      mutationOptions.onCompleted?.();
    });

    expect(t).toHaveBeenCalledWith('auth.forgotPassword.successMessage');

    expect(toastSuccess).toHaveBeenCalledWith(
      'auth.forgotPassword.successMessage',
    );
  });

  it('handles mutation error and can set email field error', async () => {
    const error = new Error('User not found');

    forgotPassword.mockRejectedValue(error);

    const { result } = renderHook(() => useForgotPasswordForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(handleFormError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        t,
        fieldErrorKeys: ['auth.errors.userNotFound'],
        context: 'ForgotPassword error',
        setFieldError: expect.any(Function),
      }),
    );

    const errorOptions = vi.mocked(handleFormError).mock.calls[0][1];

    errorOptions.setFieldError?.('auth.errors.userNotFound');

    expect(setErrors).toHaveBeenCalledWith({
      email: 'auth.errors.userNotFound',
    });
  });

  it('returns form state and loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      forgotPassword,
      {
        loading: true,
      },
    ] as never);

    vi.mocked(useValidatedForm).mockReturnValue({
      formData,
      errors: {
        email: 'Invalid email',
      },
      setErrors,
      validateForm,
      handleChange,
    } as never);

    const { result } = renderHook(() => useForgotPasswordForm());

    expect(result.current.formData).toBe(formData);

    expect(result.current.errors).toEqual({
      email: 'Invalid email',
    });

    expect(result.current.loading).toBe(true);

    expect(result.current.handleChange).toBe(handleChange);
  });
});
