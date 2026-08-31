import { act, renderHook } from '@testing-library/react';
import type { DocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { createCvSchema, type CreateCvFormValues } from '@/lib/validations/cv';

import { useCvForm } from './useCvForm';

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

describe('useCvForm', () => {
  const mutate = vi.fn();
  const validateForm = vi.fn();
  const validateField = vi.fn();
  const handleChange = vi.fn();
  const setFormData = vi.fn();
  const clearErrors = vi.fn();
  const success = vi.fn();
  const t = vi.fn();
  const onSuccess = vi.fn();

  const mutation = {} as DocumentNode;

  const initialValues: CreateCvFormValues = {
    name: '',
    education: '',
    description: '',
  };

  let formData: CreateCvFormValues;

  beforeEach(() => {
    vi.clearAllMocks();

    formData = {
      name: '',
      education: '',
      description: '',
    };

    vi.mocked(useMutation).mockReturnValue([
      mutate,
      { loading: false },
    ] as never);

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useToast).mockReturnValue({
      success,
    } as never);

    vi.mocked(useValidatedForm).mockImplementation(
      () =>
        ({
          formData,
          errors: {},
          validateForm,
          validateField,
          handleChange,
          setFormData,
          clearErrors,
        }) as never,
    );

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );
  });

  it('configures validated form with initial values and schema', () => {
    renderHook(() =>
      useCvForm({
        mutation,
        initialValues,
        successMessageKey: 'cvCreated',
        defaultSuccessMessage: 'CV created',
        errorContext: 'Create CV',
        buildVariables: () => ({}),
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues,
      schema: createCvSchema,
    });

    expect(useMutation).toHaveBeenCalledWith(mutation);
  });

  it('does not submit when validation fails', async () => {
    validateForm.mockReturnValue(false);

    const buildVariables = vi.fn();

    const { result } = renderHook(() =>
      useCvForm({
        mutation,
        initialValues,
        successMessageKey: 'cvCreated',
        defaultSuccessMessage: 'CV created',
        errorContext: 'Create CV',
        buildVariables,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(submitResult).toBe(false);
    expect(buildVariables).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('trims form values and submits mutation', async () => {
    validateForm.mockReturnValue(true);

    formData = {
      name: '  Frontend CV  ',
      education: '  BSU  ',
      description: '  Frontend developer CV  ',
    };

    const buildVariables = vi.fn((values: CreateCvFormValues) => ({
      cv: values,
    }));

    mutate.mockResolvedValue({
      data: {},
    });

    const { result } = renderHook(() =>
      useCvForm({
        mutation,
        initialValues,
        successMessageKey: 'cvCreated',
        defaultSuccessMessage: 'CV created',
        errorContext: 'Create CV',
        buildVariables,
        onSuccess,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(buildVariables).toHaveBeenCalledWith({
      name: 'Frontend CV',
      education: 'BSU',
      description: 'Frontend developer CV',
    });

    expect(mutate).toHaveBeenCalledWith({
      variables: {
        cv: {
          name: 'Frontend CV',
          education: 'BSU',
          description: 'Frontend developer CV',
        },
      },
    });

    expect(clearErrors).toHaveBeenCalledTimes(1);

    expect(success).toHaveBeenCalledWith('CV created');

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(submitResult).toBe(true);
  });

  it('handles mutation error and returns false', async () => {
    validateForm.mockReturnValue(true);

    formData = {
      name: 'Frontend CV',
      education: 'BSU',
      description: 'Description',
    };

    const error = new Error('Mutation failed');

    mutate.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useCvForm({
        mutation,
        initialValues,
        successMessageKey: 'cvCreated',
        defaultSuccessMessage: 'CV created',
        errorContext: 'Create CV',
        buildVariables: (values) => ({
          cv: values,
        }),
        onSuccess,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'Create CV',
    });

    expect(submitResult).toBe(false);
    expect(success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(clearErrors).not.toHaveBeenCalled();
  });

  it('resets form to initial values and clears errors', () => {
    const { result } = renderHook(() =>
      useCvForm({
        mutation,
        initialValues,
        successMessageKey: 'cvCreated',
        defaultSuccessMessage: 'CV created',
        errorContext: 'Create CV',
        buildVariables: () => ({}),
      }),
    );

    act(() => {
      result.current.resetForm();
    });

    expect(setFormData).toHaveBeenCalledWith(initialValues);
    expect(clearErrors).toHaveBeenCalledTimes(1);
  });

  it('returns mutation loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      mutate,
      { loading: true },
    ] as never);

    const { result } = renderHook(() =>
      useCvForm({
        mutation,
        initialValues,
        successMessageKey: 'cvCreated',
        defaultSuccessMessage: 'CV created',
        errorContext: 'Create CV',
        buildVariables: () => ({}),
      }),
    );

    expect(result.current.loading).toBe(true);
  });
});
