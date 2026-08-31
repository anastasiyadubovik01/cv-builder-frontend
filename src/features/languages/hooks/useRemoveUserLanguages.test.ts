import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRemoveUserLanguages } from './useRemoveUserLanguages';
import { handleFormError } from '@/lib/error/errorHandler';

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

describe('useRemoveUserLanguages hook', () => {
  const testUserId = '151';
  const testLanguageNames = ['English', 'Spanish'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading false and return handleRemove function', () => {
    const { result } = renderHook(() =>
      useRemoveUserLanguages({ userId: testUserId }),
    );

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleRemove).toBe('function');
  });

  it('should successfully remove languages when handleRemove is called with names', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteProfileLanguage: { affected: 2 },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useRemoveUserLanguages({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleRemove(testLanguageNames);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        language: {
          userId: testUserId,
          name: testLanguageNames,
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'users.languages.removeSuccess',
    );
  });

  it('should return false immediately when names array is empty without calling mutation', async () => {
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useRemoveUserLanguages({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleRemove([]);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle removing a single language', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteProfileLanguage: { affected: 1 },
      },
    });

    const { result } = renderHook(() =>
      useRemoveUserLanguages({ userId: testUserId }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleRemove(['English']);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        language: {
          userId: testUserId,
          name: ['English'],
        },
      },
    });
  });

  it('should catch mutation errors and invoke handleFormError properly', async () => {
    const backendError = new Error('Failed to remove languages');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useRemoveUserLanguages({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleRemove(testLanguageNames);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Remove user languages',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle onSuccess as optional parameter', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteProfileLanguage: { affected: 1 },
      },
    });

    const { result } = renderHook(() =>
      useRemoveUserLanguages({ userId: testUserId }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleRemove(['French']);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });
});
