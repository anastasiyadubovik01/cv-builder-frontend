import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeletePosition } from './useDeletePosition';
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

describe('useDeletePosition hook', () => {
  const testPositionId = '5';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading false and return handleDelete function', () => {
    const { result } = renderHook(() => useDeletePosition());

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleDelete).toBe('function');
  });

  it('should successfully delete position when handleDelete is called', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deletePosition: { affected: 1 },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useDeletePosition({
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleDelete(testPositionId);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        position: { positionId: testPositionId },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'positions.notifications.deleteSuccess',
    );
  });

  it('should return false and not call onSuccess when mutation returns affected: 0', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deletePosition: { affected: 0 },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useDeletePosition({
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleDelete(testPositionId);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should catch mutation errors and invoke handleFormError properly', async () => {
    const backendError = new Error('Failed to delete position');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useDeletePosition({
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleDelete(testPositionId);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Delete Position',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle onSuccess as optional parameter', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deletePosition: { affected: 1 },
      },
    });

    const { result } = renderHook(() => useDeletePosition());

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleDelete(testPositionId);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });

  it('should handle different position IDs correctly', async () => {
    const anotherPositionId = '10';
    mockMutate.mockResolvedValueOnce({
      data: {
        deletePosition: { affected: 1 },
      },
    });

    const { result } = renderHook(() => useDeletePosition());

    await act(async () => {
      await result.current.handleDelete(anotherPositionId);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        position: { positionId: anotherPositionId },
      },
    });
  });
});
