import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ADD_CV_PROJECT_MUTATION } from '@/api/cv-projects';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { parseCommaSeparated } from '@/lib/helpers/formatters';
import { createCvProjectSchema } from '@/lib/validations/cv-project';

import { useCvProjectForm } from './useCvProjectForm';
import { useAddCvProjectForm } from './useAddCvProjectForm';

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

vi.mock('@/lib/helpers/formatters', () => ({
  parseCommaSeparated: vi.fn(),
}));

vi.mock('@/lib/validations/cv-project', () => ({
  createCvProjectSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock('./useCvProjectForm', () => ({
  useCvProjectForm: vi.fn(),
}));

describe('useAddCvProjectForm', () => {
  const addCvProject = vi.fn();
  const validateForm = vi.fn();
  const validateField = vi.fn();
  const handleChange = vi.fn();
  const setFieldValue = vi.fn();
  const setFormData = vi.fn();
  const clearErrors = vi.fn();
  const getAutoFilledProjectData = vi.fn();
  const toastSuccess = vi.fn();
  const onSuccess = vi.fn();

  const t = vi.fn((key: string) => key);

  const formData = {
    projectId: 'project-1',
    startDate: ' 2025-01-01 ',
    endDate: '',
    roles: 'Developer, Lead',
    responsibilities: 'Coding, Testing',
    domain: 'HR',
    description: 'CV Builder',
    environment: 'React, TypeScript',
    projectStartDate: '2025-01-01',
    projectEndDate: '',
  };

  const catalogProjects = [{ id: 'project-1', name: 'CV Builder' }];
  const positions = [{ id: 'position-1', name: 'Developer' }];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({ t } as never);

    vi.mocked(useToast).mockReturnValue({
      success: toastSuccess,
    } as never);

    vi.mocked(useCvProjectForm).mockReturnValue({
      catalogProjects,
      positions,
      loadingCatalog: false,
      getAutoFilledProjectData,
    } as never);

    vi.mocked(useValidatedForm).mockReturnValue({
      formData,
      errors: {},
      validateForm,
      validateField,
      handleChange,
      setFieldValue,
      setFormData,
      clearErrors,
    } as never);

    vi.mocked(useMutation).mockReturnValue([
      addCvProject,
      { loading: false },
    ] as never);

    vi.mocked(createCvProjectSchema.safeParse).mockReturnValue({
      success: true,
    } as never);

    vi.mocked(parseCommaSeparated)
      .mockReturnValueOnce(['Developer', 'Lead'])
      .mockReturnValueOnce(['Coding', 'Testing']);

    validateForm.mockReturnValue(true);
    addCvProject.mockResolvedValue({});
    onSuccess.mockResolvedValue(undefined);
  });

  it('configures form and mutation', () => {
    const { result } = renderHook(() =>
      useAddCvProjectForm({
        cvId: 'cv-1',
        onSuccess,
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: {
        projectId: '',
        startDate: '',
        endDate: '',
        roles: '',
        responsibilities: '',
        domain: '',
        description: '',
        environment: '',
        projectStartDate: '',
        projectEndDate: '',
      },
      schema: createCvProjectSchema,
    });

    expect(useMutation).toHaveBeenCalledWith(ADD_CV_PROJECT_MUTATION);

    expect(result.current.catalogProjects).toBe(catalogProjects);
    expect(result.current.positions).toBe(positions);
    expect(result.current.isValid).toBe(true);
  });

  it('auto-fills selected project data', () => {
    const autofillData = {
      projectId: 'project-2',
      domain: 'Finance',
    };

    getAutoFilledProjectData.mockReturnValue(autofillData);

    const { result } = renderHook(() => useAddCvProjectForm({ cvId: 'cv-1' }));

    act(() => {
      result.current.handleProjectSelect('project-2');
    });

    const updater = setFormData.mock.calls[0][0];

    expect(updater({ ...formData })).toEqual({
      ...formData,
      ...autofillData,
    });

    expect(clearErrors).toHaveBeenCalled();
  });

  it('does nothing when selected project is not found', () => {
    getAutoFilledProjectData.mockReturnValue(null);

    const { result } = renderHook(() => useAddCvProjectForm({ cvId: 'cv-1' }));

    act(() => {
      result.current.handleProjectSelect('missing');
    });

    expect(setFormData).not.toHaveBeenCalled();
    expect(clearErrors).not.toHaveBeenCalled();
  });

  it('does not submit invalid form', async () => {
    validateForm.mockReturnValue(false);

    const { result } = renderHook(() => useAddCvProjectForm({ cvId: 'cv-1' }));

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(addCvProject).not.toHaveBeenCalled();
  });

  it('adds project and resets form after success', async () => {
    const { result } = renderHook(() =>
      useAddCvProjectForm({
        cvId: 'cv-1',
        onSuccess,
      }),
    );

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(addCvProject).toHaveBeenCalledWith({
      variables: {
        project: {
          cvId: 'cv-1',
          projectId: 'project-1',
          start_date: '2025-01-01',
          end_date: null,
          roles: ['Developer', 'Lead'],
          responsibilities: ['Coding', 'Testing'],
        },
      },
    });

    expect(setFormData).toHaveBeenCalledWith({
      projectId: '',
      startDate: '',
      endDate: '',
      roles: '',
      responsibilities: '',
      domain: '',
      description: '',
      environment: '',
      projectStartDate: '',
      projectEndDate: '',
    });

    expect(clearErrors).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(success).toBe(true);
  });

  it('uses trimmed end date when provided', async () => {
    vi.mocked(useValidatedForm).mockReturnValue({
      formData: {
        ...formData,
        endDate: ' 2025-12-31 ',
      },
      errors: {},
      validateForm,
      validateField,
      handleChange,
      setFieldValue,
      setFormData,
      clearErrors,
    } as never);

    const { result } = renderHook(() => useAddCvProjectForm({ cvId: 'cv-1' }));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(addCvProject).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          project: expect.objectContaining({
            end_date: '2025-12-31',
          }),
        },
      }),
    );
  });

  it('handles mutation error', async () => {
    const error = new Error('Add failed');

    addCvProject.mockRejectedValue(error);

    const { result } = renderHook(() => useAddCvProjectForm({ cvId: 'cv-1' }));

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'Add CV Project',
    });

    expect(success).toBe(false);
  });

  it('resets form', () => {
    const { result } = renderHook(() => useAddCvProjectForm({ cvId: 'cv-1' }));

    act(() => {
      result.current.resetForm();
    });

    expect(setFormData).toHaveBeenCalled();
    expect(clearErrors).toHaveBeenCalled();
  });

  it('combines mutation and catalog loading states', () => {
    vi.mocked(useCvProjectForm).mockReturnValue({
      catalogProjects,
      positions,
      loadingCatalog: true,
      getAutoFilledProjectData,
    } as never);

    const { result } = renderHook(() => useAddCvProjectForm({ cvId: 'cv-1' }));

    expect(result.current.loading).toBe(true);
  });
});
