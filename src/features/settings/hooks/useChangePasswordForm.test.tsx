import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChangePasswordForm } from './useChangePasswordForm';
import type React from 'react';
import { SERVER_ERROR_CODES } from '@/lib/error/errors';

const oldPasswordIncorrectError = SERVER_ERROR_CODES.OLD_PASSWORD_INCORRECT;

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
  handleFormError: (
    error: unknown,
    options: {
      setFieldError?: (key: string) => void;
    },
  ) => {
    if (error instanceof Error && error.message === oldPasswordIncorrectError) {
      options.setFieldError?.('settings.validation.currentPasswordIncorrect');
    }
  },
}));

describe('useChangePasswordForm hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    expect(result.current.isValid).toBe(true);

    await act(async () => {
      const syntheticFormEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.SyntheticEvent<HTMLFormElement>;

      await result.current.handleSubmit(syntheticFormEvent);
    });

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

  it('should handle backend mutation errors correctly using handleFormError', async () => {
    const backendError = new Error(oldPasswordIncorrectError);
    mockMutate.mockRejectedValueOnce(backendError);

    const { result } = renderHook(() => useChangePasswordForm());

    act(() => {
      result.current.handleChange('oldPassword')({
        target: { value: 'wrongPassword' },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handleChange('newPassword')({
        target: { value: 'newPassword123' },
      } as React.ChangeEvent<HTMLInputElement>);

      result.current.handleChange('confirmPassword')({
        target: { value: 'newPassword123' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      const syntheticFormEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.SyntheticEvent<HTMLFormElement>;

      await result.current.handleSubmit(syntheticFormEvent);
    });

    expect(result.current.errors.oldPassword).toBe(
      'settings.validation.currentPasswordIncorrect',
    );
  });
});
