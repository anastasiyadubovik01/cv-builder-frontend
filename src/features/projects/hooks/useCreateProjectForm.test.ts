import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CREATE_PROJECT_MUTATION } from '@/api/projects';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  type CreateProjectInputValues,
  createProjectSchema,
} from '@/lib/validations/project';

import { useCreateProjectForm } from './useCreateProjectForm';

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

describe('useCreateProjectForm', () => {
  const createProject = vi.fn();
  const validateForm = vi.fn();
  const handleChange = vi.fn();
  const setFieldValue = vi.fn();
  const setFormData = vi.fn();
  const clearErrors = vi.fn();
  const success = vi.fn();
  const t = vi.fn();
  const onSuccess = vi.fn();

  let formData: CreateProjectInputValues;

  beforeEach(() => {
    vi.clearAllMocks();

    formData = {
      name: '',
      domain: '',
      startDate: '',
      endDate: '',
      description: '',
      environment: '',
    };

    vi.mocked(useMutation).mockReturnValue([
      createProject,
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
          handleChange,
          setFieldValue,
          setFormData,
          clearErrors,
        }) as never,
    );

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );
  });

  it('configures validated form with initial values and schema', () => {
    renderHook(() => useCreateProjectForm());

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: {
        name: '',
        domain: '',
        startDate: '',
        endDate: '',
        description: '',
        environment: '',
      },
      schema: createProjectSchema,
    });
  });

  it('does not create project when validation fails', async () => {
    validateForm.mockReturnValue(false);

    const { result } = renderHook(() => useCreateProjectForm());

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(submitResult).toBe(false);
    expect(createProject).not.toHaveBeenCalled();
  });

  it('creates project with prepared form data', async () => {
    validateForm.mockReturnValue(true);

    formData = {
      name: '  CV Builder  ',
      domain: '  HR  ',
      startDate: '  2025-01-01  ',
      endDate: '',
      description: '  CV management application  ',
      environment: ' React, TypeScript,  GraphQL ,, ',
    };

    createProject.mockResolvedValue({
      data: {},
    });

    const { result } = renderHook(() =>
      useCreateProjectForm({
        onSuccess,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(createProject).toHaveBeenCalledWith({
      variables: {
        project: {
          name: 'CV Builder',
          domain: 'HR',
          start_date: '2025-01-01',
          end_date: null,
          description: 'CV management application',
          environment: ['React', 'TypeScript', 'GraphQL'],
        },
      },
    });

    expect(setFormData).toHaveBeenCalledWith({
      name: '',
      domain: '',
      startDate: '',
      endDate: '',
      description: '',
      environment: '',
    });

    expect(clearErrors).toHaveBeenCalledTimes(1);

    expect(success).toHaveBeenCalledWith(
      'Project has been successfully created',
    );

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(submitResult).toBe(true);
  });

  it('sends end date when it is provided', async () => {
    validateForm.mockReturnValue(true);

    formData = {
      name: 'Project',
      domain: 'Finance',
      startDate: '2024-01-01',
      endDate: '  2025-01-01  ',
      description: 'Description',
      environment: 'React',
    };

    createProject.mockResolvedValue({
      data: {},
    });

    const { result } = renderHook(() => useCreateProjectForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(createProject).toHaveBeenCalledWith({
      variables: {
        project: expect.objectContaining({
          end_date: '2025-01-01',
        }),
      },
    });
  });

  it('handles mutation error and returns false', async () => {
    validateForm.mockReturnValue(true);

    formData = {
      name: 'Project',
      domain: 'Finance',
      startDate: '2024-01-01',
      endDate: '',
      description: 'Description',
      environment: 'React',
    };

    const error = new Error('Create failed');

    createProject.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useCreateProjectForm({
        onSuccess,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'Create Project',
    });

    expect(submitResult).toBe(false);

    expect(success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(setFormData).not.toHaveBeenCalled();
  });

  it('resets form data and errors', () => {
    const { result } = renderHook(() => useCreateProjectForm());

    act(() => {
      result.current.resetForm();
    });

    expect(setFormData).toHaveBeenCalledWith({
      name: '',
      domain: '',
      startDate: '',
      endDate: '',
      description: '',
      environment: '',
    });

    expect(clearErrors).toHaveBeenCalledTimes(1);
  });

  it('returns mutation loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      createProject,
      { loading: true },
    ] as never);

    const { result } = renderHook(() => useCreateProjectForm());

    expect(result.current.loading).toBe(true);
  });
});
