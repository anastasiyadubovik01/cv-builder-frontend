import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateDepartmentForm } from './useCreateDepartmentForm';
import type { ApiDepartment } from '@/api/departments';

const mockMutate = vi.fn();
const mockUseMutation = vi.fn();
const mockValidateForm = vi.fn();
const mockHandleChange = vi.fn();
const mockSetFormData = vi.fn();
const mockClearErrors = vi.fn();
const mockUseValidatedForm = vi.fn();
const mockToastSuccess = vi.fn();
const mockHandleFormError = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useMutation: (mutation: unknown) => mockUseMutation(mutation),
  gql: (str: TemplateStringsArray) => str,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: () => ({
    success: mockToastSuccess,
  }),
}));

vi.mock('@/components/hooks/useValidatedForm', () => ({
  useValidatedForm: (options: unknown) => mockUseValidatedForm(options),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: (error: unknown, options: unknown) =>
    mockHandleFormError(error, options),
}));

describe('useCreateDepartmentForm', () => {
  const mockDepartments: ApiDepartment[] = [
    {
      id: '1',
      created_at: '2026-01-01T00:00:00.000Z',
      name: 'DevOps',
    },
  ];

  const defaultValidatedFormResult = {
    formData: { name: '' },
    errors: {},
    validateForm: mockValidateForm,
    handleChange: mockHandleChange,
    setFormData: mockSetFormData,
    clearErrors: mockClearErrors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue([mockMutate, { loading: false }]);
    mockUseValidatedForm.mockReturnValue(defaultValidatedFormResult);
    mockValidateForm.mockReturnValue(true);
  });

  it('should initialize correctly with empty values and required methods', () => {
    const { result } = renderHook(() =>
      useCreateDepartmentForm({ departments: mockDepartments }),
    );

    expect(result.current.formData).toEqual({ name: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.duplicateName).toBe(false);
    expect(typeof result.current.handleChange).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
  });

  it('should detect duplicate department name case-insensitively', () => {
    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: { name: '  DevOps  ' },
    });

    const { result } = renderHook(() =>
      useCreateDepartmentForm({ departments: mockDepartments }),
    );

    expect(result.current.duplicateName).toBe(true);
  });

  it('should successfully submit form and trigger success actions', async () => {
    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: { name: 'Marketing' },
    });
    mockMutate.mockResolvedValueOnce({
      data: { createDepartment: { id: '2', name: 'Marketing' } },
    });
    const mockOnSuccess = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useCreateDepartmentForm({
        departments: mockDepartments,
        onSuccess: mockOnSuccess,
      }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        department: {
          name: 'Marketing',
        },
      },
    });
    expect(mockSetFormData).toHaveBeenCalled();
    expect(mockClearErrors).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'departments.notifications.createSuccess',
    );
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should prevent submission if validation fails or duplicate name exists', async () => {
    mockValidateForm.mockReturnValue(false);

    const { result } = renderHook(() =>
      useCreateDepartmentForm({ departments: mockDepartments }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should handle mutation error correctly', async () => {
    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: { name: 'Marketing' },
    });
    const mutationError = new Error('Network error');
    mockMutate.mockRejectedValueOnce(mutationError);

    const { result } = renderHook(() =>
      useCreateDepartmentForm({ departments: mockDepartments }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(mockHandleFormError).toHaveBeenCalledWith(mutationError, {
      t: expect.any(Function),
      context: 'Create Department',
    });
  });
});
