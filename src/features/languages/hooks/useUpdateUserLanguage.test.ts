import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateUserLanguage } from './useUpdateUserLanguage';
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

describe('useUpdateUserLanguage hook', () => {
  const testUserId = '10';
  const initialLanguageName = 'English';
  const initialProficiency = 'Native' as Proficiency;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = (
    result: { current: ReturnType<typeof useUpdateUserLanguage> },
    values: { languageName: string; proficiency: Proficiency },
  ) => {
    act(() => {
      result.current.setFieldValue('languageName', values.languageName);
      result.current.setFieldValue('proficiency', values.proficiency);
    });
  };

  it('should initialize with provided form values, loading false, and return translation function', () => {
    const { result } = renderHook(() =>
      useUpdateUserLanguage({
        userId: testUserId,
        languageName: initialLanguageName,
        proficiency: initialProficiency,
      }),
    );

    expect(result.current.formData).toEqual({
      languageName: initialLanguageName,
      proficiency: initialProficiency,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(typeof result.current.setFieldValue).toBe('function');
    expect(typeof result.current.validateField).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('should validate form and compute isValid status correctly when fields change', () => {
    const { result } = renderHook(() =>
      useUpdateUserLanguage({
        userId: testUserId,
        languageName: initialLanguageName,
        proficiency: initialProficiency,
      }),
    );

    expect(result.current.isValid).toBe(true);

    fillForm(result, {
      languageName: '',
      proficiency: '' as Proficiency,
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.formData).toEqual({
      languageName: '',
      proficiency: '',
    });

    fillForm(result, {
      languageName: 'Spanish',
      proficiency: 'B2' as Proficiency,
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.formData).toEqual({
      languageName: 'Spanish',
      proficiency: 'B2',
    });
  });

  it('should successfully submit form when data is valid, call mutation, trigger success toast, execute onSuccess callback, and keep form values', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        updateProfileLanguage: {
          languages: [{ name: 'Spanish', proficiency: 'B2' }],
        },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useUpdateUserLanguage({
        userId: testUserId,
        languageName: initialLanguageName,
        proficiency: initialProficiency,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      languageName: 'Spanish',
      proficiency: 'B2' as Proficiency,
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
          name: initialLanguageName,
          proficiency: 'B2',
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'users.languages.updateSuccess',
    );
    expect(result.current.formData).toEqual({
      languageName: 'Spanish',
      proficiency: 'B2',
    });
  });

  it('should return false and not invoke mutation if form validation fails during submission', async () => {
    const { result } = renderHook(() =>
      useUpdateUserLanguage({
        userId: testUserId,
        languageName: initialLanguageName,
        proficiency: initialProficiency,
      }),
    );

    fillForm(result, {
      languageName: '',
      proficiency: '' as Proficiency,
    });

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
    const backendError = new Error('Failed to update profile language');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useUpdateUserLanguage({
        userId: testUserId,
        languageName: initialLanguageName,
        proficiency: initialProficiency,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      languageName: 'French',
      proficiency: 'C1' as Proficiency,
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
      context: 'Update user language',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle empty initial values correctly', () => {
    const { result } = renderHook(() =>
      useUpdateUserLanguage({
        userId: testUserId,
        languageName: '',
        proficiency: '' as Proficiency,
      }),
    );

    expect(result.current.formData).toEqual({
      languageName: '',
      proficiency: '',
    });
    expect(result.current.isValid).toBe(false);
  });
});
