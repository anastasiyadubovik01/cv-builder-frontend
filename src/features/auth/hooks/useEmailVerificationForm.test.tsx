import type { SyntheticEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VERIFY_MAIL_MUTATION } from '@/api/auth';
import { handleFormError } from '@/lib/error/errorHandler';
import { verifyMailSchema } from '@/lib/validations/auth';

import { useEmailVerificationForm } from './useEmailVerificationForm';

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn(),
}));

vi.mock('@/lib/validations/auth', () => ({
  verifyMailSchema: {
    safeParse: vi.fn(),
  },
}));

describe('useEmailVerificationForm', () => {
  const push = vi.fn();
  const refresh = vi.fn();

  const verifyMail = vi.fn();

  const t = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push,
      refresh,
    } as never);

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useMutation).mockReturnValue([
      verifyMail,
      {
        loading: false,
      },
    ] as never);

    vi.mocked(verifyMailSchema.safeParse).mockReturnValue({
      success: true,
      data: {
        otp: '123456',
      },
    } as never);

    verifyMail.mockResolvedValue({
      data: {},
    });
  });

  it('configures verification mutation', () => {
    renderHook(() => useEmailVerificationForm());

    expect(useMutation).toHaveBeenCalledWith(
      VERIFY_MAIL_MUTATION,
      expect.objectContaining({
        onCompleted: expect.any(Function),
      }),
    );
  });

  it('updates otp value', () => {
    const { result } = renderHook(() => useEmailVerificationForm());

    act(() => {
      result.current.handleOtpChange('123456');
    });

    expect(result.current.otp).toBe('123456');
  });

  it('shows validation error and does not submit invalid otp', async () => {
    vi.mocked(verifyMailSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            message: 'Invalid OTP',
          },
        ],
      },
    } as never);

    const { result } = renderHook(() => useEmailVerificationForm());

    act(() => {
      result.current.handleOtpChange('123');
    });

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);

    expect(verifyMailSchema.safeParse).toHaveBeenCalledWith({
      otp: '123',
    });

    expect(result.current.error).toBe('Invalid OTP');

    expect(verifyMail).not.toHaveBeenCalled();
  });

  it('submits valid otp', async () => {
    const { result } = renderHook(() => useEmailVerificationForm());

    act(() => {
      result.current.handleOtpChange('123456');
    });

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(verifyMailSchema.safeParse).toHaveBeenCalledWith({
      otp: '123456',
    });

    expect(verifyMail).toHaveBeenCalledWith({
      variables: {
        mail: {
          otp: '123456',
        },
      },
    });

    expect(result.current.error).toBeUndefined();
  });

  it('redirects to home after successful verification', async () => {
    renderHook(() => useEmailVerificationForm());

    const mutationOptions = vi.mocked(useMutation).mock.calls[0][1] as {
      onCompleted?: () => void;
    };

    act(() => {
      mutationOptions.onCompleted?.();
    });

    expect(push).toHaveBeenCalledWith('/');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('handles backend error and can set otp field error', async () => {
    const error = new Error('Invalid OTP');

    verifyMail.mockRejectedValue(error);

    const { result } = renderHook(() => useEmailVerificationForm());

    act(() => {
      result.current.handleOtpChange('123456');
    });

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
        fieldErrorKeys: ['auth.errors.invalidOtp', 'auth.errors.expiredOtp'],
        setFieldError: expect.any(Function),
        context: 'Email verification error',
      }),
    );

    const errorOptions = vi.mocked(handleFormError).mock.calls[0][1];

    act(() => {
      errorOptions.setFieldError?.('auth.errors.invalidOtp');
    });

    expect(result.current.error).toBe('auth.errors.invalidOtp');
  });

  it('clears existing error when otp changes', async () => {
    vi.mocked(verifyMailSchema.safeParse).mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            message: 'Invalid OTP',
          },
        ],
      },
    } as never);

    const { result } = renderHook(() => useEmailVerificationForm());

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.error).toBe('Invalid OTP');

    act(() => {
      result.current.handleOtpChange('123456');
    });

    expect(result.current.otp).toBe('123456');
    expect(result.current.error).toBeUndefined();
  });

  it('returns mutation loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      verifyMail,
      {
        loading: true,
      },
    ] as never);

    const { result } = renderHook(() => useEmailVerificationForm());

    expect(result.current.loading).toBe(true);
  });
});
