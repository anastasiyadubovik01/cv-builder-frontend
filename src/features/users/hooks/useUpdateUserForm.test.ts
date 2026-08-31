import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateUserForm } from './useUpdateUserForm';
import type { UpdateUserFormValues } from '@/lib/validations/user';

const mockMutateProfile = vi.fn();
const mockMutateUser = vi.fn();
const mockUseMutation = vi.fn();
const mockValidateForm = vi.fn();
const mockValidateField = vi.fn();
const mockSetFieldValue = vi.fn();
const mockHandleChange = vi.fn();
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

describe('useUpdateUserForm', () => {
  const mockCatalogs = {
    departments: [{ id: '1', name: 'DevOps' }],
    positions: [{ id: '1', name: 'Developer' }],
  };

  const initialValues: UpdateUserFormValues = {
    email: 'john.doe@example.com',
    password: 'test2test',
    firstName: 'John',
    lastName: 'Doe',
    departmentId: '1',
    positionId: '1',
    role: 'Employee',
  };

  const defaultValidatedFormResult = {
    formData: initialValues,
    errors: {},
    validateForm: mockValidateForm,
    validateField: mockValidateField,
    setFieldValue: mockSetFieldValue,
    handleChange: mockHandleChange,
    clearErrors: mockClearErrors,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockImplementation((mutation) => {
      if (mutation.definitions[0].name.value === 'UpdateProfile') {
        return [mockMutateProfile, { loading: false }];
      }
      return [mockMutateUser, { loading: false }];
    });
    mockUseUserCatalogs.mockReturnValue(mockCatalogs);
    mockUseValidatedForm.mockReturnValue(defaultValidatedFormResult);
    mockValidateForm.mockReturnValue(true);
  });

  it('should initialize with provided initial values and catalogs', () => {
    const { result } = renderHook(() =>
      useUpdateUserForm({
        userId: '123',
        initialValues,
      }),
    );

    expect(result.current.formData).toEqual(initialValues);
    expect(result.current.departments).toEqual(mockCatalogs.departments);
    expect(result.current.positions).toEqual(mockCatalogs.positions);
    expect(result.current.loading).toBe(false);
  });

  it('should call updateProfile mutation when names are changed', async () => {
    const modifiedFormData = {
      ...initialValues,
      firstName: 'Jonathan',
    };

    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: modifiedFormData,
    });
    mockMutateProfile.mockResolvedValueOnce({
      data: { updateProfile: { userId: '123' } },
    });
    const mockOnSuccess = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useUpdateUserForm({
        userId: '123',
        initialValues,
        onSuccess: mockOnSuccess,
      }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(true);
    expect(mockMutateProfile).toHaveBeenCalledWith({
      variables: {
        profile: {
          userId: '123',
          first_name: 'Jonathan',
          last_name: 'Doe',
        },
      },
    });
    expect(mockMutateUser).not.toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalledWith('users.update.success');
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should call updateUser mutation when role or department/position are changed', async () => {
    const modifiedFormData = {
      ...initialValues,
      role: 'Admin' as const,
    };

    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: modifiedFormData,
    });
    mockMutateUser.mockResolvedValueOnce({
      data: { updateUser: { userId: '123' } },
    });

    const { result } = renderHook(() =>
      useUpdateUserForm({
        userId: '123',
        initialValues,
      }),
    );

    let success = false;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(true);
    expect(mockMutateProfile).not.toHaveBeenCalled();
    expect(mockMutateUser).toHaveBeenCalledWith({
      variables: {
        user: {
          userId: '123',
          departmentId: '1',
          positionId: '1',
          role: 'Admin',
        },
      },
    });
  });

  it('should handle mutation error correctly during update', async () => {
    const modifiedFormData = {
      ...initialValues,
      firstName: 'Jonathan',
    };

    mockUseValidatedForm.mockReturnValue({
      ...defaultValidatedFormResult,
      formData: modifiedFormData,
    });
    const updateError = new Error('Failed to update');
    mockMutateProfile.mockRejectedValueOnce(updateError);

    const { result } = renderHook(() =>
      useUpdateUserForm({
        userId: '123',
        initialValues,
      }),
    );

    let success = true;
    await act(async () => {
      success = await result.current.handleSubmit();
    });

    expect(success).toBe(false);
    expect(mockHandleFormError).toHaveBeenCalledWith(updateError, {
      t: expect.any(Function),
      context: 'Update user',
    });
  });
});
