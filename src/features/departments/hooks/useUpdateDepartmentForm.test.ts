import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateDepartmentForm } from './useUpdateDepartmentForm';
import type { ApiDepartment } from '@/api/departments';

const mockMutate = vi.fn();
const mockUseMutation = vi.fn();
const mockValidateForm = vi.fn();
const mockHandleChange = vi.fn();
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

describe('useUpdateDepartmentForm', () => {
  const mockDepartment: ApiDepartment = {
    id: '1',
    created_at: '2026-01-01T00:00:00.000Z',
    name: 'DevOps',
  };

  const mockDepartments: ApiDepartment[] = [
    mockDepartment,
    {
      id: '2',
      created_at: '2026-01-02T00:00:00.000Z',
      name: 'Marketing',
    },
  ];

  const defaultValidatedFormResult = {
    formData: { name: 'DevOps' },
    errors: {},
    validateForm: mockValidateForm,
    handleChange: mockHandleChange,
    clearErrors: mockClearErrors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue([mockMutate, { loading: false }]);
    mockUseValidatedForm.mockReturnValue(defaultValidatedFormResult);
    mockValidateForm.mockReturnValue(true);
  });

  it('should initialize with department name as initial form value', () => {
    renderHook(() =>
      useUpdateDepartmentForm({
        department: mockDepartment,
        departments: mockDepartments,
      }),
    );

    expect(mockUseValidatedForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValues: { name: 'DevOps' },
      }),
    );
  });

  it('should not flag duplicate name when matching own department id', () => {
    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: { name: 'DevOps' },
    });

    const { result } = renderHook(() =>
      useUpdateDepartmentForm({
        department: mockDepartment,
        departments: mockDepartments,
      }),
    );

    expect(result.current.duplicateName).toBe(false);
  });

  it('should detect duplicate name when matching another department', () => {
    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: { name: 'marketing' },
    });

    const { result } = renderHook(() =>
      useUpdateDepartmentForm({
        department: mockDepartment,
        departments: mockDepartments,
      }),
    );

    expect(result.current.duplicateName).toBe(true);
  });

  it('should successfully submit update and trigger success callbacks', async () => {
    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: { name: 'Mobile' },
    });
    mockMutate.mockResolvedValueOnce({
      data: { updateDepartment: { ...mockDepartment, name: 'Mobile' } },
    });
    const mockOnSuccess = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useUpdateDepartmentForm({
        department: mockDepartment,
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
          departmentId: '1',
          name: 'Mobile',
        },
      },
    });
    expect(mockClearErrors).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'departments.notifications.updateSuccess',
    );
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should handle update mutation error correctly', async () => {
    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: { name: 'Mobile' },
    });
    const updateError = new Error('Update failed');
    mockMutate.mockRejectedValueOnce(updateError);

    const { result } = renderHook(() =>
      useUpdateDepartmentForm({
        department: mockDepartment,
        departments: mockDepartments,
      }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(mockHandleFormError).toHaveBeenCalledWith(updateError, {
      t: expect.any(Function),
      context: 'Update Department',
    });
  });
});
