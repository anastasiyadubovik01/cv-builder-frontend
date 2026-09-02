import type { ChangeEvent, SyntheticEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { DocumentNode } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { setAuthCookies } from '@/app/actions/auth';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { handleFormError } from '@/lib/error/errorHandler';

import { useAuthForm } from './useAuthForm';

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
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

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn(),
}));

type FormValues = {
  email: string;
  password: string;
};

type MutationData = {
  login: {
    access_token: string;
    refresh_token: string;
  } | null;
};

describe('useAuthForm', () => {
  const push = vi.fn();
  const refresh = vi.fn();

  const submitMutation = vi.fn();
  const validateForm = vi.fn();
  const validateField = vi.fn();
  const setFieldValue = vi.fn();

  const t = vi.fn();

  const mutation = {} as DocumentNode;

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const initialValues: FormValues = {
    email: '',
    password: '',
  };

  const formData: FormValues = {
    email: 'test@example.com',
    password: 'password123',
  };

  const getTokens = vi.fn((data: MutationData) => data.login);

  const renderAuthForm = () =>
    renderHook(() =>
      useAuthForm<FormValues, MutationData>({
        initialValues,
        schema,
        mutation,
        getTokens,
        redirectTo: '/dashboard',
        errorContext: 'Sign In',
      }),
    );

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push,
      refresh,
    } as never);

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useValidatedForm).mockReturnValue({
      formData,
      errors: {},
      validateForm,
      validateField,
      setFieldValue,
    } as never);

    validateForm.mockReturnValue(true);

    vi.mocked(useMutation).mockReturnValue([
      submitMutation,
      {
        loading: false,
      },
    ] as never);

    submitMutation.mockResolvedValue({});

    vi.mocked(setAuthCookies).mockResolvedValue(undefined);
  });

  it('configures validated form and mutation', () => {
    renderAuthForm();

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues,
      schema,
    });

    expect(useMutation).toHaveBeenCalledWith(
      mutation,
      expect.objectContaining({
        onCompleted: expect.any(Function),
      }),
    );
  });

  it('updates field value on change', () => {
    const { result } = renderAuthForm();

    const event = {
      target: {
        value: 'new@example.com',
      },
    } as ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange('email')(event);
    });

    expect(setFieldValue).toHaveBeenCalledWith('email', 'new@example.com');
  });

  it('validates field on blur', () => {
    const { result } = renderAuthForm();

    act(() => {
      result.current.handleBlur('email')();
    });

    expect(validateField).toHaveBeenCalledWith('email');
  });

  it('does not submit when form validation fails', async () => {
    validateForm.mockReturnValue(false);

    const { result } = renderAuthForm();

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(validateForm).toHaveBeenCalledTimes(1);

    expect(submitMutation).not.toHaveBeenCalled();
  });

  it('submits form data when validation succeeds', async () => {
    const { result } = renderAuthForm();

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalledTimes(1);

    expect(submitMutation).toHaveBeenCalledWith({
      variables: {
        auth: formData,
      },
    });
  });

  it('handles mutation error', async () => {
    const error = new Error('Login failed');

    submitMutation.mockRejectedValue(error);

    const { result } = renderAuthForm();

    const event = {
      preventDefault: vi.fn(),
    } as unknown as SyntheticEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'Sign In',
    });
  });

  it('stores tokens and redirects after successful mutation', async () => {
    renderAuthForm();

    const mutationOptions = vi.mocked(useMutation).mock.calls[0][1] as {
      onCompleted?: (data: MutationData) => Promise<void>;
    };

    await act(async () => {
      await mutationOptions.onCompleted?.({
        login: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
        },
      });
    });

    expect(getTokens).toHaveBeenCalledWith({
      login: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      },
    });

    expect(setAuthCookies).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(push).toHaveBeenCalledWith('/dashboard');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not redirect when mutation does not return tokens', async () => {
    renderAuthForm();

    const mutationOptions = vi.mocked(useMutation).mock.calls[0][1] as {
      onCompleted?: (data: MutationData) => Promise<void>;
    };

    await act(async () => {
      await mutationOptions.onCompleted?.({
        login: null,
      });
    });

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('does not redirect when refresh token is missing', async () => {
    renderAuthForm();

    const mutationOptions = vi.mocked(useMutation).mock.calls[0][1] as {
      onCompleted?: (data: MutationData) => Promise<void>;
    };

    await act(async () => {
      await mutationOptions.onCompleted?.({
        login: {
          access_token: 'access-token',
          refresh_token: '',
        },
      });
    });

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('returns form state and mutation loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      submitMutation,
      {
        loading: true,
      },
    ] as never);

    vi.mocked(useValidatedForm).mockReturnValue({
      formData,
      errors: {
        email: 'Invalid email',
      },
      validateForm,
      validateField,
      setFieldValue,
    } as never);

    const { result } = renderAuthForm();

    expect(result.current.formData).toBe(formData);

    expect(result.current.errors).toEqual({
      email: 'Invalid email',
    });

    expect(result.current.loading).toBe(true);
  });
});
