import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UPDATE_CV_MUTATION } from '@/api/cvs';
import type { CreateCvFormValues } from '@/lib/validations/cv';

import { useCvForm } from './useCvForm';
import { useUpdateCvForm } from './useUpdateCvForm';

vi.mock('./useCvForm', () => ({
  useCvForm: vi.fn(),
}));

describe('useUpdateCvForm', () => {
  const onSuccess = vi.fn();

  const initialValues: CreateCvFormValues = {
    name: 'Frontend CV',
    education: 'BSU',
    description: 'Developer CV',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCvForm).mockReturnValue({
      formData: initialValues,
      errors: {},
      loading: false,
      isValid: true,
      validateField: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      resetForm: vi.fn(),
      setFormData: vi.fn(),
      t: vi.fn(),
    } as never);
  });

  it('configures CV form for update', () => {
    renderHook(() =>
      useUpdateCvForm({
        cvId: 'cv-123',
        initialValues,
      }),
    );

    const config = vi.mocked(useCvForm).mock.calls[0][0];

    expect(config.mutation).toBe(UPDATE_CV_MUTATION);
    expect(config.initialValues).toBe(initialValues);

    expect(config.successMessageKey).toBe('cvs.notifications.updateSuccess');

    expect(config.defaultSuccessMessage).toBe('CV was successfully updated!');

    expect(config.errorContext).toBe('Update CV');
  });

  it('builds update variables with cvId and form values', () => {
    renderHook(() =>
      useUpdateCvForm({
        cvId: 'cv-123',
        initialValues,
      }),
    );

    const config = vi.mocked(useCvForm).mock.calls[0][0];

    const variables = config.buildVariables({
      name: 'Updated CV',
      education: 'MIT',
      description: 'Updated description',
    });

    expect(variables).toEqual({
      cv: {
        cvId: 'cv-123',
        name: 'Updated CV',
        education: 'MIT',
        description: 'Updated description',
      },
    });
  });

  it('passes onSuccess callback to CV form', () => {
    renderHook(() =>
      useUpdateCvForm({
        cvId: 'cv-123',
        initialValues,
        onSuccess,
      }),
    );

    const config = vi.mocked(useCvForm).mock.calls[0][0];

    expect(config.onSuccess).toBe(onSuccess);
  });

  it('returns result from useCvForm', () => {
    const mockedForm = {
      formData: initialValues,
      errors: {},
      loading: true,
      isValid: true,
      validateField: vi.fn(),
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
      resetForm: vi.fn(),
      setFormData: vi.fn(),
      t: vi.fn(),
    };

    vi.mocked(useCvForm).mockReturnValue(mockedForm as never);

    const { result } = renderHook(() =>
      useUpdateCvForm({
        cvId: 'cv-123',
        initialValues,
      }),
    );

    expect(result.current).toBe(mockedForm);
  });
});
