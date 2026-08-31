import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CREATE_CV_MUTATION } from '@/api/cvs';

import { useCreateCvForm } from './useCreateCvForm';
import { useCvForm } from './useCvForm';

vi.mock('./useCvForm', () => ({
  useCvForm: vi.fn(),
}));

describe('useCreateCvForm', () => {
  const handleSubmit = vi.fn();
  const resetForm = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCvForm).mockReturnValue({
      formData: {
        name: '',
        education: '',
        description: '',
      },
      errors: {},
      loading: false,
      isValid: true,
      validateField: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit,
      resetForm,
      setFormData: vi.fn(),
      t: vi.fn(),
    } as never);
  });

  it('configures CV form for creation', () => {
    renderHook(() => useCreateCvForm());

    const config = vi.mocked(useCvForm).mock.calls[0][0];

    expect(config.mutation).toBe(CREATE_CV_MUTATION);

    expect(config.initialValues).toEqual({
      name: '',
      education: '',
      description: '',
    });

    expect(config.successMessageKey).toBe('cvs.notifications.createSuccess');

    expect(config.defaultSuccessMessage).toBe(
      'CV has been successfully created',
    );

    expect(config.errorContext).toBe('Create CV');
  });

  it('builds variables with userId when it is provided', () => {
    renderHook(() =>
      useCreateCvForm({
        userId: 'user-123',
      }),
    );

    const config = vi.mocked(useCvForm).mock.calls[0][0];

    const variables = config.buildVariables({
      name: 'Frontend CV',
      education: 'BSU',
      description: 'Description',
    });

    expect(variables).toEqual({
      cv: {
        name: 'Frontend CV',
        education: 'BSU',
        description: 'Description',
        userId: 'user-123',
      },
    });
  });

  it('builds variables without userId when it is not provided', () => {
    renderHook(() => useCreateCvForm());

    const config = vi.mocked(useCvForm).mock.calls[0][0];

    const variables = config.buildVariables({
      name: 'Frontend CV',
      education: 'BSU',
      description: 'Description',
    });

    expect(variables).toEqual({
      cv: {
        name: 'Frontend CV',
        education: 'BSU',
        description: 'Description',
        userId: undefined,
      },
    });
  });

  it('passes onSuccess callback to CV form', () => {
    renderHook(() =>
      useCreateCvForm({
        onSuccess,
      }),
    );

    const config = vi.mocked(useCvForm).mock.calls[0][0];

    expect(config.onSuccess).toBe(onSuccess);
  });

  it('resets form after successful submit', async () => {
    handleSubmit.mockResolvedValue(true);

    const { result } = renderHook(() => useCreateCvForm());

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(resetForm).toHaveBeenCalledTimes(1);
    expect(submitResult).toBe(true);
  });

  it('does not reset form when submit fails', async () => {
    handleSubmit.mockResolvedValue(false);

    const { result } = renderHook(() => useCreateCvForm());

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(resetForm).not.toHaveBeenCalled();
    expect(submitResult).toBe(false);
  });
});
