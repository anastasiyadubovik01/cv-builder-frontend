import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteLanguage } from './useDeleteLanguage';
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

describe('useDeleteLanguage hook', () => {
  const testLanguageId = '25';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading false and return handleDelete function', () => {
    const { result } = renderHook(() => useDeleteLanguage());

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleDelete).toBe('function');
  });

  it('should successfully delete language when handleDelete is called', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteLanguage: { affected: 1 },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useDeleteLanguage({
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleDelete(testLanguageId);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        language: { languageId: testLanguageId },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'languages.admin.notifications.deleteSuccess',
    );
  });

  it('should return false and not call onSuccess when mutation returns affected: 0', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteLanguage: { affected: 0 },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useDeleteLanguage({
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleDelete(testLanguageId);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should catch mutation errors and invoke handleFormError properly', async () => {
    const backendError = new Error('Failed to delete language');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useDeleteLanguage({
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleDelete(testLanguageId);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Delete Language',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle onSuccess as optional parameter', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteLanguage: { affected: 1 },
      },
    });

    const { result } = renderHook(() => useDeleteLanguage());

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleDelete(testLanguageId);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });
});
