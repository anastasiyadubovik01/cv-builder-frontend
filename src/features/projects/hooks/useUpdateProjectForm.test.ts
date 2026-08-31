import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UPDATE_PROJECT_MUTATION } from '@/api/projects';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  type CreateProjectInputValues,
  createProjectSchema,
} from '@/lib/validations/project';

import type { Project } from '../types';
import { useUpdateProjectForm } from './useUpdateProjectForm';

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

describe('useUpdateProjectForm', () => {
  const updateProject = vi.fn();
  const validateForm = vi.fn();
  const handleChange = vi.fn();
  const setFieldValue = vi.fn();
  const setFormData = vi.fn();
  const clearErrors = vi.fn();
  const success = vi.fn();
  const t = vi.fn();
  const onSuccess = vi.fn();

  let formData: CreateProjectInputValues;

  const project = {
    id: 'project-123',
    name: 'CV Builder',
    domain: 'HR',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    description: 'CV management app',
    environmentSkills: ['React', 'TypeScript'],
  } as Project;

  beforeEach(() => {
    vi.clearAllMocks();

    formData = {
      name: project.name,
      domain: project.domain,
      startDate: project.startDate,
      endDate: project.endDate,
      description: project.description ?? '',
      environment: 'React, TypeScript',
    };

    vi.mocked(useMutation).mockReturnValue([
      updateProject,
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

  it('configures form with project initial values', () => {
    renderHook(() =>
      useUpdateProjectForm({
        project,
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: {
        name: 'CV Builder',
        domain: 'HR',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        description: 'CV management app',
        environment: 'React, TypeScript',
      },
      schema: createProjectSchema,
    });
  });

  it('uses empty end date when project is active', () => {
    const activeProject = {
      ...project,
      endDate: 'Present',
    } as Project;

    renderHook(() =>
      useUpdateProjectForm({
        project: activeProject,
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: expect.objectContaining({
          endDate: '',
        }),
      }),
    );
  });

  it('does not update project when validation fails', async () => {
    validateForm.mockReturnValue(false);

    const { result } = renderHook(() =>
      useUpdateProjectForm({
        project,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(submitResult).toBe(false);
    expect(updateProject).not.toHaveBeenCalled();
  });

  it('updates project with prepared form data', async () => {
    validateForm.mockReturnValue(true);

    formData = {
      name: '  Updated Project  ',
      domain: '  Finance  ',
      startDate: '  2024-02-01  ',
      endDate: '',
      description: '  Updated description  ',
      environment: ' React, TypeScript, GraphQL ,, ',
    };

    updateProject.mockResolvedValue({
      data: {},
    });

    const { result } = renderHook(() =>
      useUpdateProjectForm({
        project,
        onSuccess,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(updateProject).toHaveBeenCalledWith({
      variables: {
        project: {
          projectId: 'project-123',
          name: 'Updated Project',
          domain: 'Finance',
          start_date: '2024-02-01',
          end_date: null,
          description: 'Updated description',
          environment: ['React', 'TypeScript', 'GraphQL'],
        },
      },
    });

    expect(clearErrors).toHaveBeenCalledTimes(1);

    expect(success).toHaveBeenCalledWith(
      'Project has been successfully updated',
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
      endDate: '  2025-06-01  ',
      description: 'Description',
      environment: 'React',
    };

    updateProject.mockResolvedValue({
      data: {},
    });

    const { result } = renderHook(() =>
      useUpdateProjectForm({
        project,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(updateProject).toHaveBeenCalledWith({
      variables: {
        project: expect.objectContaining({
          projectId: 'project-123',
          end_date: '2025-06-01',
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

    const error = new Error('Update failed');

    updateProject.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useUpdateProjectForm({
        project,
        onSuccess,
      }),
    );

    let submitResult: boolean | undefined;

    await act(async () => {
      submitResult = await result.current.handleSubmit();
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'Update Project',
    });

    expect(submitResult).toBe(false);
    expect(success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('resets form to original project values', () => {
    const { result } = renderHook(() =>
      useUpdateProjectForm({
        project,
      }),
    );

    act(() => {
      result.current.resetForm();
    });

    expect(setFormData).toHaveBeenCalledWith({
      name: 'CV Builder',
      domain: 'HR',
      startDate: '2024-01-01',
      endDate: '2025-01-01',
      description: 'CV management app',
      environment: 'React, TypeScript',
    });

    expect(clearErrors).toHaveBeenCalledTimes(1);
  });

  it('returns mutation loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      updateProject,
      { loading: true },
    ] as never);

    const { result } = renderHook(() =>
      useUpdateProjectForm({
        project,
      }),
    );

    expect(result.current.loading).toBe(true);
  });
});
