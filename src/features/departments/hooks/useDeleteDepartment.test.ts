import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteDepartment } from './useDeleteDepartment';

const mockHandleDelete = vi.fn();
const mockUseDeleteEntity = vi.fn();

vi.mock('@/components/hooks/useDeleteEntity', () => ({
  useDeleteEntity: (options: unknown) => mockUseDeleteEntity(options),
}));

vi.mock('@apollo/client/react', () => ({
  gql: (str: TemplateStringsArray) => str,
}));

describe('useDeleteDepartment', () => {
  const mockDeleteResult = {
    handleDelete: mockHandleDelete,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteEntity.mockReturnValue(mockDeleteResult);
  });

  it('should initialize and return handleDelete function and loading flag', () => {
    const { result } = renderHook(() => useDeleteDepartment());

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleDelete).toBe('function');
  });

  it('should successfully trigger entity deletion and handle success callback', async () => {
    const mockOnSuccess = vi.fn().mockResolvedValue(undefined);
    mockHandleDelete.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useDeleteDepartment({ onSuccess: mockOnSuccess }),
    );

    await act(async () => {
      await result.current.handleDelete('123');
    });

    const deleteEntityConfig = mockUseDeleteEntity.mock.calls[0]?.[0] as {
      successMessageKey: string;
      errorContext: string;
      buildVariables: (departmentId: string) => {
        department: { departmentId: string };
      };
      isSuccessCheck: (data: {
        deleteDepartment: { affected: number };
      }) => boolean;
      onSuccess?: () => void | Promise<void>;
    };

    expect(deleteEntityConfig.successMessageKey).toBe(
      'departments.notifications.deleteSuccess',
    );
    expect(deleteEntityConfig.errorContext).toBe('Delete Department');
    expect(deleteEntityConfig.buildVariables('123')).toEqual({
      department: { departmentId: '123' },
    });
    expect(
      deleteEntityConfig.isSuccessCheck({ deleteDepartment: { affected: 1 } }),
    ).toBe(true);
    expect(
      deleteEntityConfig.isSuccessCheck({ deleteDepartment: { affected: 0 } }),
    ).toBe(false);

    expect(mockHandleDelete).toHaveBeenCalledWith('123');
  });

  it('should handle deletion loading state correctly', () => {
    mockUseDeleteEntity.mockReturnValue({
      ...mockDeleteResult,
      loading: true,
    });

    const { result } = renderHook(() => useDeleteDepartment());
    expect(result.current.loading).toBe(true);
  });
});
