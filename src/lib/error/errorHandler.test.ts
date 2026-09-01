import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast as sonnerToast } from 'sonner';
import type { TFunction } from 'i18next';
import { handleFormError } from '@/lib/error/errorHandler';
import { SERVER_ERROR_CODES, AuthRefreshError } from '@/lib/error/errors';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('errorHandler', () => {
  const mockT = vi.fn(
    (key: string) => `translated_${key}`,
  ) as unknown as TFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('console', {
      ...console,
      error: vi.fn(),
    });
  });

  it('calls setFieldError when the mapped error translation key is included in fieldErrorKeys', () => {
    const setFieldError = vi.fn();
    const error = new Error(SERVER_ERROR_CODES.USER_ALREADY_EXISTS);

    handleFormError(error, {
      t: mockT,
      fieldErrorKeys: ['auth.errors.userAlreadyExists'],
      setFieldError,
    });

    expect(setFieldError).toHaveBeenCalledTimes(1);
    expect(setFieldError).toHaveBeenCalledWith('auth.errors.userAlreadyExists');
    expect(sonnerToast.error).not.toHaveBeenCalled();
  });

  it('shows sonner toast when translation key is not part of fieldErrorKeys', () => {
    const setFieldError = vi.fn();
    const error = new Error(SERVER_ERROR_CODES.INVALID_CREDENTIALS);

    handleFormError(error, {
      t: mockT,
      fieldErrorKeys: ['auth.errors.userAlreadyExists'],
      setFieldError,
    });

    expect(setFieldError).not.toHaveBeenCalled();
    expect(sonnerToast.error).toHaveBeenCalledTimes(1);
    expect(sonnerToast.error).toHaveBeenCalledWith('translated_toast.error', {
      description: 'translated_auth.errors.invalidCredentials',
    });
  });

  it('shows sonner toast when setFieldError is not provided', () => {
    const error = new AuthRefreshError();

    handleFormError(error, {
      t: mockT,
    });

    expect(sonnerToast.error).toHaveBeenCalledTimes(1);
    expect(sonnerToast.error).toHaveBeenCalledWith('translated_toast.error', {
      description: 'translated_auth.errors.authRefreshFailed',
    });
  });

  it('logs error to console when context is provided and NODE_ENV is development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('Some error');
    const context = 'LoginForm';

    handleFormError(error, {
      t: mockT,
      context,
    });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(`${context}:`, error);
  });

  it('does not log error to console when context is omitted', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const error = new Error('Some error');

    handleFormError(error, {
      t: mockT,
    });

    expect(console.error).not.toHaveBeenCalled();
  });

  it('does not log error to console when NODE_ENV is production even if context is provided', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = new Error('Some error');
    const context = 'LoginForm';

    handleFormError(error, {
      t: mockT,
      context,
    });

    expect(console.error).not.toHaveBeenCalled();
  });
});
