import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDepartments } from './useDepartments';
import type { ApiDepartment, DepartmentsQueryData } from '@/api/departments';
import type { DepartmentSortField } from '../types';

const mockPaginatedQuery = vi.fn();

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: (options: unknown) => mockPaginatedQuery(options),
}));

vi.mock('@apollo/client/react', () => ({
  gql: (str: TemplateStringsArray) => str,
}));

describe('useDepartments', () => {
  const mockDepartmentItems: ApiDepartment[] = [
    {
      id: '1',
      created_at: '2026-01-01T00:00:00.000Z',
      name: 'DevOps',
    },
    {
      id: '2',
      created_at: '2026-01-02T00:00:00.000Z',
      name: 'Marketing',
    },
  ];

  const mockPaginatedData = {
    items: mockDepartmentItems,
    total: 2,
    page: 1,
    limit: 10,
    total_pages: 1,
  };

  const mockPaginatedResult = {
    data: { departments: mockPaginatedData },
    loading: false,
    error: null,
    refetch: vi.fn(),
    handleRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPaginatedQuery.mockReturnValue(mockPaginatedResult);
  });

  it('should initialize successfully and return pagination methods and state', () => {
    const { result } = renderHook(() => useDepartments());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.handleRefresh).toBe('function');
  });

  it('should correctly execute extractPaginatedData, filtering, and sorting utilities', () => {
    renderHook(() => useDepartments());
    const paginatedArg = mockPaginatedQuery.mock.calls[0]?.[0] as {
      extractPaginatedData: (
        data: DepartmentsQueryData,
      ) => typeof mockPaginatedData;
      filterItem: (department: ApiDepartment, queryStr: string) => boolean;
      getSortValue: (
        department: ApiDepartment,
        field: DepartmentSortField,
      ) => string;
    };
    const { extractPaginatedData, filterItem, getSortValue } = paginatedArg;

    const extracted = extractPaginatedData({ departments: mockPaginatedData });
    expect(extracted).toEqual(mockPaginatedData);

    const fallbackExtracted = extractPaginatedData({
      departments: null,
    } as unknown as DepartmentsQueryData);
    expect(fallbackExtracted).toEqual({
      items: [],
      total: 0,
      total_pages: 0,
    });

    expect(filterItem(mockDepartmentItems[0], 'finance')).toBe(false);
    expect(getSortValue(mockDepartmentItems[0], 'name')).toBe('DevOps');
    expect(
      getSortValue(mockDepartmentItems[0], 'unknown' as DepartmentSortField),
    ).toBe('');
  });

  it('should handle loading and error states properly from paginated query execution', () => {
    const customError = new Error('Failed to fetch departments');
    mockPaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      loading: true,
      error: customError,
    });

    const { result } = renderHook(() => useDepartments());
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toEqual(customError);
  });
});
