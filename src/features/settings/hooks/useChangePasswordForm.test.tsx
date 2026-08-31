import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChangePasswordForm } from './useChangePasswordForm';
import type React from 'react';
import { SERVER_ERROR_CODES } from '@/lib/error/errors';
import * as errorHandler from '@/lib/error/errorHandler';

const oldPasswordIncorrectError = SERVER_ERROR_CODES.OLD_PASSWORD_INCORRECT;
const samePasswordError = SERVER_ERROR_CODES.OLD_PASSWORD_SAME_NEW_PASSWORD;
const passwordsDoNotMatchError = SERVER_ERROR_CODES.CONFIRM_PASSWORD_MISMATCH;
const unknownKeyError = 'unknown.error.key';

const mockMutate = vi.fn();
const mockToastSuccess = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockMutate, { loading: false }],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: () => ({
    success: mockToastSuccess,
  }),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn((error, options) => {
    if (error instanceof Error) {
      if (error.message === oldPasswordIncorrectError) {
        options.setFieldError?.('settings.validation.currentPasswordIncorrect');
      } else if (error.message === samePasswordError) {
        options.setFieldError?.('settings.validation.samePassword');
      } else if (error.message === passwordsDoNotMatchError) {
        options.setFieldError?.('settings.validation.passwordsDoNotMatch');
      }
    }
  }),
}));

describe('useChangePasswordForm hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillValidForm = (result: {
    current: ReturnType<typeof useChangePasswordForm>;
  }) => {
    act(() => {
      result.current.handleChange('oldPassword')({
        target: { value: 'oldPassword123' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange('newPassword')({
        target: { value: 'newPassword123' },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange('confirmPassword')({
        target: { value: 'newPassword123' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
  };

  const fillForm = (
    result: {
      current: ReturnType<typeof useChangePasswordForm>;
    },
    values: {
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) => {
    act(() => {
      result.current.handleChange('oldPassword')({
        target: { value: values.oldPassword },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange('newPassword')({
        target: { value: values.newPassword },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange('confirmPassword')({
        target: { value: values.confirmPassword },
      } as React.ChangeEvent<HTMLInputElement>);
    });
  };

  const submitForm = async (result: {
    current: ReturnType<typeof useChangePasswordForm>;
  }) => {
    await act(async () => {
      const syntheticFormEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.SyntheticEvent<HTMLFormElement>;

      await result.current.handleSubmit(syntheticFormEvent);
    });
  };

  it('should initialize with empty form values and loading false', () => {
    const { result } = renderHook(() => useChangePasswordForm());

    expect(result.current.formData).toEqual({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('should update field value when handleChange is invoked', () => {
    const { result } = renderHook(() => useChangePasswordForm());

    act(() => {
      const syntheticEvent = {
        target: { value: 'oldPassword123' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange('oldPassword')(syntheticEvent);
    });
    expect(result.current.formData.oldPassword).toBe('oldPassword123');
  });

  it('should validate field on blur when handleBlur is invoked', () => {
    const { result } = renderHook(() => useChangePasswordForm());
    act(() => {
      result.current.handleBlur('oldPassword')();
    });
    expect(result.current.errors.oldPassword).toBeDefined();
  });

  it('should successfully submit form when data is valid', async () => {
    mockMutate.mockResolvedValueOnce({ data: { changePassword: true } });
    const { result } = renderHook(() => useChangePasswordForm());
    fillValidForm(result);
    expect(result.current.isValid).toBe(true);
    await submitForm(result);

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        args: {
          oldPassword: 'oldPassword123',
          newPassword: 'newPassword123',
          confirmPassword: 'newPassword123',
        },
      },
    });

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'settings.notifications.passwordChanged',
    );
    expect(result.current.formData).toEqual({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  });

  it('should handle backend mutation errors for incorrect old password correctly', async () => {
    const backendError = new Error(oldPasswordIncorrectError);
    mockMutate.mockRejectedValueOnce(backendError);

    const { result } = renderHook(() => useChangePasswordForm());
    fillForm(result, {
      oldPassword: 'wrongPassword',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    });
    await submitForm(result);

    expect(result.current.errors.oldPassword).toBe(
      'settings.validation.currentPasswordIncorrect',
    );
  });

  it('should handle backend mutation errors for same password correctly', async () => {
    const backendError = new Error(samePasswordError);
    mockMutate.mockRejectedValueOnce(backendError);

    const { result } = renderHook(() => useChangePasswordForm());

    fillForm(result, {
      oldPassword: 'Password123',
      newPassword: 'Password123',
      confirmPassword: 'Password123',
    });

    await submitForm(result);

    expect(result.current.errors.newPassword).toBe(
      'settings.validation.samePassword',
    );
  });

  it('should handle backend mutation errors for passwords do not match correctly', async () => {
    const backendError = new Error(passwordsDoNotMatchError);
    mockMutate.mockRejectedValueOnce(backendError);

    const { result } = renderHook(() => useChangePasswordForm());

    fillForm(result, {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'different123',
    });

    await submitForm(result);

    expect(result.current.errors.confirmPassword).toBe(
      'settings.validation.passwordsDoNotMatch',
    );
  });

  it('should not submit if form is invalid', async () => {
    const { result } = renderHook(() => useChangePasswordForm());

    await submitForm(result);

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle unknown error key without setting field error', async () => {
    const unknownError = new Error('unknown error');
    mockMutate.mockRejectedValueOnce(unknownError);

    const mockHandleFormError = errorHandler.handleFormError as ReturnType<
      typeof vi.fn
    >;
    mockHandleFormError.mockImplementationOnce((_, options) => {
      options.setFieldError?.(unknownKeyError);
    });

    const { result } = renderHook(() => useChangePasswordForm());

    fillValidForm(result);
    expect(result.current.isValid).toBe(true);

    await submitForm(result);

    expect(result.current.errors.oldPassword).toBeUndefined();
    expect(result.current.errors.newPassword).toBeUndefined();
    expect(result.current.errors.confirmPassword).toBeUndefined();

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should set error on newPassword when translationKey is samePassword', async () => {
    const mockHandleFormError = errorHandler.handleFormError as ReturnType<
      typeof vi.fn
    >;
    mockHandleFormError.mockImplementationOnce((_, options) => {
      options.setFieldError?.('settings.validation.samePassword');
    });

    const { result } = renderHook(() => useChangePasswordForm());
    fillValidForm(result);

    const error = new Error('unknown error');
    mockMutate.mockRejectedValueOnce(error);

    await submitForm(result);

    expect(result.current.errors.newPassword).toBe(
      'settings.validation.samePassword',
    );
    expect(result.current.errors.oldPassword).toBeUndefined();
    expect(result.current.errors.confirmPassword).toBeUndefined();
  });

  it('should set error on confirmPassword when translationKey is passwordsDoNotMatch', async () => {
    const mockHandleFormError = errorHandler.handleFormError as ReturnType<
      typeof vi.fn
    >;
    mockHandleFormError.mockImplementationOnce((_, options) => {
      options.setFieldError?.('settings.validation.passwordsDoNotMatch');
    });

    const { result } = renderHook(() => useChangePasswordForm());
    fillValidForm(result);

    const error = new Error('unknown error');
    mockMutate.mockRejectedValueOnce(error);

    await submitForm(result);

    expect(result.current.errors.confirmPassword).toBe(
      'settings.validation.passwordsDoNotMatch',
    );
    expect(result.current.errors.oldPassword).toBeUndefined();
    expect(result.current.errors.newPassword).toBeUndefined();
  });
});
