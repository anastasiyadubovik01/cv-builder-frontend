import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddUserLanguage } from './useAddUserLanguage';
import { handleFormError } from '@/lib/error/errorHandler';
import type { Proficiency } from '@/features/languages/types';

const mockMutate = vi.fn();
const mockToastSuccess = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockMutate, { loading: false }],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: () => ({
    success: mockToastSuccess,
  }),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn(),
}));

describe('useAddUserLanguage hook', () => {
  const testUserId = '10';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = (
    result: { current: ReturnType<typeof useAddUserLanguage> },
    values: { languageName: string; proficiency: Proficiency },
  ) => {
    act(() => {
      result.current.setFieldValue('languageName', values.languageName);
      result.current.setFieldValue('proficiency', values.proficiency);
    });
  };

  it('should initialize with empty form values, loading false, invalid state, and return translation function', () => {
    const { result } = renderHook(() =>
      useAddUserLanguage({ userId: testUserId }),
    );

    expect(result.current.formData).toEqual({
      languageName: '',
      proficiency: '',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(typeof result.current.setFieldValue).toBe('function');
    expect(typeof result.current.validateField).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('should validate form and compute isValid status correctly when fields change', () => {
    const { result } = renderHook(() =>
      useAddUserLanguage({ userId: testUserId }),
    );

    expect(result.current.isValid).toBe(false);

    fillForm(result, {
      languageName: 'English',
      proficiency: 'Native' as Proficiency,
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.formData).toEqual({
      languageName: 'English',
      proficiency: 'Native',
    });
  });

  it('should successfully submit form when data is valid, call mutation, trigger success toast, execute onSuccess callback and reset form values', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        addProfileLanguage: {
          languages: [{ name: 'English', proficiency: 'Native' }],
        },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useAddUserLanguage({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      languageName: 'English',
      proficiency: 'Native' as Proficiency,
    });

    expect(result.current.isValid).toBe(true);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        language: {
          userId: '10',
          name: 'English',
          proficiency: 'Native',
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith('users.languages.addSuccess');
    expect(result.current.formData).toEqual({
      languageName: '',
      proficiency: '',
    });
  });

  it('should return false and not invoke mutation if form validation fails during submission', async () => {
    const { result } = renderHook(() =>
      useAddUserLanguage({ userId: testUserId }),
    );

    expect(result.current.isValid).toBe(false);

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should catch mutation errors and invoke handleFormError properly without triggering success callbacks', async () => {
    const backendError = new Error('Failed to add profile language');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useAddUserLanguage({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      languageName: 'German',
      proficiency: 'B2' as Proficiency,
    });

    expect(result.current.isValid).toBe(true);

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Add user language',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
