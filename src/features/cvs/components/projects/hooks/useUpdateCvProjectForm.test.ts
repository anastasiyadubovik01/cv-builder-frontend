import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  UPDATE_CV_PROJECT_MUTATION,
  type ApiCvProject,
} from '@/api/cv-projects';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  createCvProjectSchema,
  type UpdateCvProjectInputValues,
} from '@/lib/validations/cv-project';

import { useCvProjectForm } from './useCvProjectForm';
import { useUpdateCvProjectForm } from './useUpdateCvProjectForm';

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

vi.mock('@/lib/validations/cv-project', () => ({
  createCvProjectSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock('./useCvProjectForm', () => ({
  useCvProjectForm: vi.fn(),
}));

describe('useUpdateCvProjectForm', () => {
  const updateCvProject = vi.fn();
  const validateForm = vi.fn();
  const validateField = vi.fn();
  const handleChange = vi.fn();
  const setFieldValue = vi.fn();
  const setFormData = vi.fn();
  const clearErrors = vi.fn();

  const toastSuccess = vi.fn();
  const onSuccess = vi.fn();
  const t = vi.fn((key: string) => key);

  const project = {
    id: 'cv-project-1',
    start_date: '',
    end_date: '',
    roles: ['Developer'],
    responsibilities: ['Coding'],
    domain: '',
    description: '',
    environment: undefined,
    project: {
      id: 'project-1',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      domain: 'HR',
      description: 'CV platform',
      environment: ['React', 'TypeScript'],
    },
  } as unknown as ApiCvProject;

  const initialFormData: UpdateCvProjectInputValues = {
    projectId: 'project-1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    roles: 'Developer',
    responsibilities: 'Coding',
    domain: 'HR',
    description: 'CV platform',
    environment: 'React, TypeScript',
    projectStartDate: '2024-01-01',
    projectEndDate: '2024-12-31',
  };

  const dirtyFormData: UpdateCvProjectInputValues = {
    ...initialFormData,
    startDate: ' 2024-02-01 ',
    endDate: ' 2024-11-30 ',
    roles: 'Developer, Lead',
    responsibilities: 'Coding, Testing',
  };

  const mockForm = (formData: UpdateCvProjectInputValues = initialFormData) => {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useToast).mockReturnValue({
      success: toastSuccess,
    } as never);

    vi.mocked(useCvProjectForm).mockReturnValue({
      catalogProjects: [{ id: 'project-1' }],
      positions: [{ id: 'position-1' }],
      loadingCatalog: false,
    } as never);

    vi.mocked(useMutation).mockReturnValue([
      updateCvProject,
      { loading: false },
    ] as never);

    vi.mocked(createCvProjectSchema.safeParse).mockReturnValue({
      success: true,
    } as never);

    validateForm.mockReturnValue(true);
    updateCvProject.mockResolvedValue({});
    onSuccess.mockResolvedValue(undefined);

    mockForm();
  });

  it('creates initial form values from nested project data', () => {
    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: initialFormData,
      schema: createCvProjectSchema,
    });

    expect(useMutation).toHaveBeenCalledWith(UPDATE_CV_PROJECT_MUTATION);

    expect(result.current.isValid).toBe(false);
  });

  it('prefers CV project values over nested catalog project values', () => {
    const ownValuesProject = {
      ...project,
      start_date: '2025-01-01',
      end_date: '2025-06-30',
      domain: 'Finance',
      description: 'Custom description',
      environment: ['Vue', 'Node.js'],
    } as unknown as ApiCvProject;

    const expectedValues: UpdateCvProjectInputValues = {
      projectId: 'project-1',
      startDate: '2025-01-01',
      endDate: '2025-06-30',
      roles: 'Developer',
      responsibilities: 'Coding',
      domain: 'Finance',
      description: 'Custom description',
      environment: 'Vue, Node.js',
      projectStartDate: '2024-01-01',
      projectEndDate: '2024-12-31',
    };

    mockForm(expectedValues);

    renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project: ownValuesProject,
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: expectedValues,
      schema: createCvProjectSchema,
    });
  });

  it('uses root dates as project boundaries when nested project dates are missing', () => {
    const projectWithoutNestedDates = {
      ...project,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      project: {
        ...project.project,
        start_date: '',
        end_date: '',
      },
    } as unknown as ApiCvProject;

    const expectedValues: UpdateCvProjectInputValues = {
      ...initialFormData,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      projectStartDate: '2025-01-01',
      projectEndDate: '2025-12-31',
    };

    mockForm(expectedValues);

    renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project: projectWithoutNestedDates,
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: expectedValues,
      schema: createCvProjectSchema,
    });
  });

  it('uses empty fallbacks when project values are missing', () => {
    const emptyProject = {
      id: 'cv-project-1',
      start_date: '',
      end_date: '',
      roles: [],
      responsibilities: [],
      domain: '',
      description: '',
      environment: undefined,
      project: undefined,
    } as unknown as ApiCvProject;

    const emptyValues: UpdateCvProjectInputValues = {
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
    };

    mockForm(emptyValues);

    renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project: emptyProject,
      }),
    );

    expect(useValidatedForm).toHaveBeenCalledWith({
      initialValues: emptyValues,
      schema: createCvProjectSchema,
    });
  });

  it('is valid when start date changed and schema is valid', () => {
    mockForm({
      ...initialFormData,
      startDate: '2024-02-01',
    });

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.isValid).toBe(true);
  });

  it('is valid when only end date changed', () => {
    mockForm({
      ...initialFormData,
      endDate: '2024-11-30',
    });

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.isValid).toBe(true);
  });

  it('is valid when only roles changed', () => {
    mockForm({
      ...initialFormData,
      roles: 'Developer, Lead',
    });

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.isValid).toBe(true);
  });

  it('is valid when only responsibilities changed', () => {
    mockForm({
      ...initialFormData,
      responsibilities: 'Coding, Testing',
    });

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.isValid).toBe(true);
  });

  it('ignores whitespace-only changes', () => {
    mockForm({
      ...initialFormData,
      startDate: ' 2024-01-01 ',
      endDate: ' 2024-12-31 ',
      roles: ' Developer ',
      responsibilities: ' Coding ',
    });

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.isValid).toBe(false);
  });

  it('handles missing responsibilities when checking dirty state', () => {
    const formWithoutResponsibilities = {
      ...initialFormData,
      responsibilities: undefined,
    } as unknown as UpdateCvProjectInputValues;

    const projectWithoutResponsibilities = {
      ...project,
      responsibilities: undefined,
    } as unknown as ApiCvProject;

    mockForm(formWithoutResponsibilities);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project: projectWithoutResponsibilities,
      }),
    );

    expect(result.current.isValid).toBe(false);
  });

  it('is invalid when schema validation fails', () => {
    mockForm(dirtyFormData);

    vi.mocked(createCvProjectSchema.safeParse).mockReturnValue({
      success: false,
    } as never);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.isValid).toBe(false);
  });

  it('does not submit unchanged form', async () => {
    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(validateForm).not.toHaveBeenCalled();
    expect(updateCvProject).not.toHaveBeenCalled();
  });

  it('does not submit when form validation fails', async () => {
    mockForm(dirtyFormData);
    validateForm.mockReturnValue(false);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(validateForm).toHaveBeenCalledTimes(1);
    expect(updateCvProject).not.toHaveBeenCalled();
    expect(success).toBe(false);
  });

  it('updates CV project', async () => {
    mockForm(dirtyFormData);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
        onSuccess,
      }),
    );

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(updateCvProject).toHaveBeenCalledWith({
      variables: {
        project: {
          cvId: 'cv-1',
          projectId: 'project-1',
          start_date: '2024-02-01',
          end_date: '2024-11-30',
          roles: ['Developer', 'Lead'],
          responsibilities: ['Coding', 'Testing'],
        },
      },
    });

    expect(clearErrors).toHaveBeenCalled();

    expect(toastSuccess).toHaveBeenCalledWith(
      'projects.notifications.updateCvProjectSuccess',
    );

    expect(onSuccess).toHaveBeenCalled();

    expect(success).toBe(true);
  });

  it('successfully updates without onSuccess callback', async () => {
    mockForm(dirtyFormData);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(true);
    expect(updateCvProject).toHaveBeenCalledTimes(1);
  });

  it('sends null when end date is empty', async () => {
    mockForm({
      ...dirtyFormData,
      endDate: '',
    });

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(updateCvProject).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          project: expect.objectContaining({
            end_date: null,
          }),
        },
      }),
    );
  });

  it('handles update error', async () => {
    mockForm(dirtyFormData);

    const error = new Error('Update failed');

    updateCvProject.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    let success!: boolean;

    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'Update CV Project',
    });

    expect(success).toBe(false);
  });

  it('resets form', () => {
    mockForm(dirtyFormData);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    act(() => {
      result.current.resetForm();
    });

    expect(setFormData).toHaveBeenCalledWith(initialFormData);

    expect(clearErrors).toHaveBeenCalled();
  });

  it('returns catalog data', () => {
    const catalogProjects = [{ id: 'project-1' }];
    const positions = [{ id: 'position-1' }];

    vi.mocked(useCvProjectForm).mockReturnValue({
      catalogProjects,
      positions,
      loadingCatalog: false,
    } as never);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.catalogProjects).toBe(catalogProjects);

    expect(result.current.positions).toBe(positions);
  });

  it('is loading when catalog is loading', () => {
    vi.mocked(useCvProjectForm).mockReturnValue({
      catalogProjects: [],
      positions: [],
      loadingCatalog: true,
    } as never);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.loading).toBe(true);
  });

  it('is loading when mutation is loading', () => {
    vi.mocked(useMutation).mockReturnValue([
      updateCvProject,
      { loading: true },
    ] as never);

    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.loading).toBe(true);
  });

  it('is not loading when mutation and catalogs are not loading', () => {
    const { result } = renderHook(() =>
      useUpdateCvProjectForm({
        cvId: 'cv-1',
        project,
      }),
    );

    expect(result.current.loading).toBe(false);
  });
});
