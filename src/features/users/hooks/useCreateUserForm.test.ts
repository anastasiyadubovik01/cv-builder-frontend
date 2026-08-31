import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateUserForm } from './useCreateUserForm';

const mockMutate = vi.fn();
const mockUseMutation = vi.fn();
const mockValidateForm = vi.fn();
const mockValidateField = vi.fn();
const mockSetFieldValue = vi.fn();
const mockHandleChange = vi.fn();
const mockSetFormData = vi.fn();
const mockClearErrors = vi.fn();
const mockUseValidatedForm = vi.fn();
const mockUseUserCatalogs = vi.fn();
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

vi.mock('@/features/users/hooks/useUserCatalogs', () => ({
  useUserCatalogs: () => mockUseUserCatalogs(),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: (error: unknown, options: unknown) =>
    mockHandleFormError(error, options),
}));

describe('useCreateUserForm', () => {
  const mockCatalogs = {
    departments: [{ id: '1', name: 'DevOps' }],
    positions: [{ id: '1', name: 'Developer' }],
  };

  const defaultValidatedFormResult = {
    formData: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      departmentId: '',
      positionId: '',
      role: 'Employee' as const,
    },
    errors: {},
    validateForm: mockValidateForm,
    validateField: mockValidateField,
    setFieldValue: mockSetFieldValue,
    handleChange: mockHandleChange,
    setFormData: mockSetFormData,
    clearErrors: mockClearErrors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue([mockMutate, { loading: false }]);
    mockUseUserCatalogs.mockReturnValue(mockCatalogs);
    mockUseValidatedForm.mockReturnValue(defaultValidatedFormResult);
    mockValidateForm.mockReturnValue(true);
  });

  it('should initialize correctly with empty/default form values and catalogs', () => {
    const { result } = renderHook(() => useCreateUserForm());

    expect(result.current.formData).toEqual({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      departmentId: '',
      positionId: '',
      role: 'Employee',
    });
    expect(result.current.departments).toEqual(mockCatalogs.departments);
    expect(result.current.positions).toEqual(mockCatalogs.positions);
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(typeof result.current.handleSubmit).toBe('function');
  });

  it('should successfully submit form and execute success handlers', async () => {
    const validFormData = {
      email: 'john.doe@example.com',
      password: 'StrongPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      departmentId: '1',
      positionId: '1',
      role: 'Employee' as const,
    };

    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: validFormData,
    });
    mockMutate.mockResolvedValueOnce({ data: { createUser: { id: '1' } } });
    const mockOnSuccess = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useCreateUserForm({ onSuccess: mockOnSuccess }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        user: {
          auth: {
            email: 'john.doe@example.com',
            password: 'StrongPassword123!',
          },
          profile: {
            first_name: 'John',
            last_name: 'Doe',
          },
          departmentId: '1',
          positionId: '1',
          role: 'Employee',
        },
      },
    });
    expect(mockSetFormData).toHaveBeenCalled();
    expect(mockClearErrors).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith('users.create.success');
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should prevent submission and return false if validation fails', async () => {
    mockValidateForm.mockReturnValue(false);

    const { result } = renderHook(() => useCreateUserForm());

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should handle mutation error correctly via handleFormError', async () => {
    const mutationError = new Error('Creation failed');
    mockMutate.mockRejectedValueOnce(mutationError);

    const { result } = renderHook(() => useCreateUserForm());

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(mockHandleFormError).toHaveBeenCalledWith(mutationError, {
      t: expect.any(Function),
      context: 'Create user',
    });
  });
});
