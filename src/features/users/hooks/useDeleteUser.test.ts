import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteUser } from './useDeleteUser';

const mockHandleDelete = vi.fn();
const mockUseDeleteEntity = vi.fn();

vi.mock('@/components/hooks/useDeleteEntity', () => ({
  useDeleteEntity: (options: unknown) => mockUseDeleteEntity(options),
}));

vi.mock('@apollo/client/react', () => ({
  gql: (str: TemplateStringsArray) => str,
}));

describe('useDeleteUser', () => {
  const mockDeleteResult = {
    handleDelete: mockHandleDelete,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteEntity.mockReturnValue(mockDeleteResult);
  });

  it('should initialize and return handleDelete function and loading flag', () => {
    const { result } = renderHook(() => useDeleteUser());

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleDelete).toBe('function');
  });

  it('should successfully trigger user deletion and handle success callbacks', async () => {
    const mockOnSuccess = vi.fn().mockResolvedValue(undefined);
    mockHandleDelete.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useDeleteUser({ onSuccess: mockOnSuccess }),
    );

    await act(async () => {
      await result.current.handleDelete('123');
    });

    const deleteEntityConfig = mockUseDeleteEntity.mock.calls[0]?.[0] as {
      successMessageKey: string;
      defaultSuccessMessage: string;
      errorContext: string;
      buildVariables: (userId: string) => { userId: string };
      isSuccessCheck: (data: { deleteUser: { affected: number } }) => boolean;
      onSuccess?: () => void | Promise<void>;
    };

    expect(deleteEntityConfig.successMessageKey).toBe(
      'users.notifications.deleteSuccess',
    );
    expect(deleteEntityConfig.defaultSuccessMessage).toBe(
      'User successfully deleted',
    );
    expect(deleteEntityConfig.errorContext).toBe('Delete user');
    expect(deleteEntityConfig.buildVariables('123')).toEqual({ userId: '123' });
    expect(
      deleteEntityConfig.isSuccessCheck({ deleteUser: { affected: 1 } }),
    ).toBe(true);
    expect(
      deleteEntityConfig.isSuccessCheck({ deleteUser: { affected: 0 } }),
    ).toBe(false);

    expect(mockHandleDelete).toHaveBeenCalledWith('123');
  });

  it('should handle deletion loading state correctly', () => {
    mockUseDeleteEntity.mockReturnValue({
      ...mockDeleteResult,
      loading: true,
    });

    const { result } = renderHook(() => useDeleteUser());
    expect(result.current.loading).toBe(true);
  });
});
