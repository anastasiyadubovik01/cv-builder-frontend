import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreateLanguageForm } from './useCreateLanguageForm';
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

const existingLanguages: ApiLanguage[] = [
  {
    id: '1',
    created_at: '2026-01-01',
    iso2: 'en',
    name: 'English',
    native_name: 'English',
  },
];

describe('useCreateLanguageForm hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = (
    result: { current: ReturnType<typeof useCreateLanguageForm> },
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

  it('should initialize with empty form values, loading false and invalid state', () => {
    const { result } = renderHook(() =>
      useCreateLanguageForm({ languages: existingLanguages }),
    );

    expect(result.current.formData).toEqual({
      name: '',
      iso2: '',
      nativeName: '',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.duplicateName).toBe(false);
    expect(result.current.duplicateIso).toBe(false);
  });

  it('should detect duplicate name and iso correctly (case-insensitive and trimmed)', () => {
    const { result } = renderHook(() =>
      useCreateLanguageForm({ languages: existingLanguages }),
    );

    fillForm(result, {
      name: ' english ',
      iso2: ' EN ',
      nativeName: 'English',
    });

    expect(result.current.duplicateName).toBe(true);
    expect(result.current.duplicateIso).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it('should set isValid to true when form is valid and no duplicates exist', () => {
    const { result } = renderHook(() =>
      useCreateLanguageForm({ languages: existingLanguages }),
    );

    fillForm(result, {
      name: 'French',
      iso2: 'fr',
      nativeName: 'Français',
    });

    expect(result.current.duplicateName).toBe(false);
    expect(result.current.duplicateIso).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  it('should successfully submit form when data is valid, call mutation, reset form and trigger onSuccess', async () => {
    mockMutate.mockResolvedValueOnce({ data: { createLanguage: { id: '2' } } });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useCreateLanguageForm({
        languages: existingLanguages,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      name: 'Spanish',
      iso2: 'es',
      nativeName: 'Español',
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
          name: 'Spanish',
          iso2: 'ES',
          native_name: 'Español',
        },
      },
    });
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'languages.admin.notifications.createSuccess',
    );
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(result.current.formData).toEqual({
      name: '',
      iso2: '',
      nativeName: '',
    });
  });

  it('should return false and not call mutation if form has validation errors', async () => {
    const { result } = renderHook(() =>
      useCreateLanguageForm({ languages: existingLanguages }),
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
      useCreateLanguageForm({ languages: existingLanguages }),
    );

    fillForm(result, {
      name: 'English',
      iso2: 'fr',
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
    const backendError = new Error('Network error');
    mockMutate.mockRejectedValueOnce(backendError);

    const { result } = renderHook(() =>
      useCreateLanguageForm({ languages: existingLanguages }),
    );

    fillForm(result, {
      name: 'German',
      iso2: 'de',
      nativeName: 'Deutsch',
    });

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Create Language',
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
