import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateLanguageForm } from './useUpdateLanguageForm';
import { type ApiLanguage } from '@/api/languages';
import { handleFormError } from '@/lib/error/errorHandler';
import React from 'react';

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

const currentLanguage: ApiLanguage = {
  id: '1',
  created_at: '2026-01-01',
  iso2: 'en',
  name: 'English',
  native_name: 'English',
};

const otherLanguages: ApiLanguage[] = [
  currentLanguage,
  {
    id: '2',
    created_at: '2026-01-01',
    iso2: 'fr',
    name: 'French',
    native_name: 'Français',
  },
];

describe('useUpdateLanguageForm hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = (
    result: { current: ReturnType<typeof useUpdateLanguageForm> },
    values: { name: string; iso2: string; nativeName: string },
  ) => {
    act(() => {
      result.current.handleChange('name')({
        target: { value: values.name },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange('iso2')({
        target: { value: values.iso2 },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange('nativeName')({
        target: { value: values.nativeName },
      } as React.ChangeEvent<HTMLInputElement>);
    });
  };

  it('should initialize with values from the provided language and computed isValid status', () => {
    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: currentLanguage,
        languages: otherLanguages,
      }),
    );

    expect(result.current.formData).toEqual({
      name: 'English',
      iso2: 'en',
      nativeName: 'English',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.duplicateName).toBe(false);
    expect(result.current.duplicateIso).toBe(false);
  });

  it('should handle missing native_name by defaulting to empty string', () => {
    const langWithoutNative: ApiLanguage = {
      ...currentLanguage,
      native_name: null,
    };

    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: langWithoutNative,
        languages: otherLanguages,
      }),
    );

    expect(result.current.formData.nativeName).toBe('');
  });

  it('should not flag the current language itself as a duplicate', () => {
    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: currentLanguage,
        languages: otherLanguages,
      }),
    );

    fillForm(result, {
      name: 'English',
      iso2: 'EN',
      nativeName: 'English',
    });

    expect(result.current.duplicateName).toBe(false);
    expect(result.current.duplicateIso).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('should detect duplicates against other languages correctly (case-insensitive and trimmed)', () => {
    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: currentLanguage,
        languages: otherLanguages,
      }),
    );

    fillForm(result, {
      name: ' french ',
      iso2: ' FR ',
      nativeName: 'Français',
    });

    expect(result.current.duplicateName).toBe(true);
    expect(result.current.duplicateIso).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it('should successfully submit form when data is valid, call mutation, clear errors, and trigger onSuccess', async () => {
    mockMutate.mockResolvedValueOnce({ data: { updateLanguage: { id: '1' } } });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: currentLanguage,
        languages: otherLanguages,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      name: 'Updated English',
      iso2: 'en',
      nativeName: 'Updated English',
    });

    expect(result.current.isValid).toBe(true);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        language: {
          languageId: '1',
          name: 'Updated English',
          iso2: 'EN',
          native_name: 'Updated English',
        },
      },
    });
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'languages.admin.notifications.updateSuccess',
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('should return false and not call mutation if form has validation errors', async () => {
    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: currentLanguage,
        languages: otherLanguages,
      }),
    );

    fillForm(result, {
      name: '',
      iso2: 'INVALID',
      nativeName: '',
    });

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should return false and not call mutation if there is a duplicate name or iso', async () => {
    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: currentLanguage,
        languages: otherLanguages,
      }),
    );

    fillForm(result, {
      name: 'French',
      iso2: 'en',
      nativeName: 'Anglais',
    });

    expect(result.current.duplicateName).toBe(true);

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should catch mutation errors and invoke handleFormError', async () => {
    const backendError = new Error('Update failed');
    mockMutate.mockRejectedValueOnce(backendError);

    const { result } = renderHook(() =>
      useUpdateLanguageForm({
        language: currentLanguage,
        languages: otherLanguages,
      }),
    );

    fillForm(result, {
      name: 'New English Name',
      iso2: 'en',
      nativeName: 'New English',
    });

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Update Language',
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
