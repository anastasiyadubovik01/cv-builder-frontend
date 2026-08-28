import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePositions } from './usePositions';
import type { Position, PositionsQueryResponse } from '@/api/positions';

const mockUsePaginatedQuery = vi.fn();

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: (...args: unknown[]) => mockUsePaginatedQuery(...args),
}));

describe('usePositions', () => {
  const mockPositions: Position[] = [
    {
      id: '1',
      name: 'Frontend Developer',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Backend Developer',
      created_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'DevOps Engineer',
      created_at: '2024-01-03T00:00:00Z',
    },
  ];

  const mockPaginatedResult = {
    allItems: mockPositions,
    paginatedItems: mockPositions,
    loading: false,
    error: false,
    search: '',
    setSearch: vi.fn(),
    sortBy: 'name',
    sortDirection: 'asc' as const,
    handleSort: vi.fn(),
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    setCurrentPage: vi.fn(),
    setPageSize: vi.fn(),
    handleRefresh: vi.fn().mockResolvedValue(mockPositions),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePaginatedQuery.mockReturnValue(mockPaginatedResult);
  });

  it('should initialize with correct values and return all required properties', () => {
    const { result } = renderHook(() => usePositions());
    expect(result.current.allItems).toEqual(mockPositions);
    expect(result.current.paginatedItems).toEqual(mockPositions);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(result.current.search).toBe('');
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(typeof result.current.setSearch).toBe('function');
    expect(typeof result.current.handleSort).toBe('function');
    expect(typeof result.current.setCurrentPage).toBe('function');
    expect(typeof result.current.setPageSize).toBe('function');
    expect(typeof result.current.handleRefresh).toBe('function');
  });

  it('should call usePaginatedQuery with correct parameters', () => {
    renderHook(() => usePositions());

    expect(mockUsePaginatedQuery).toHaveBeenCalledTimes(1);
    const callArgs = mockUsePaginatedQuery.mock.calls[0][0];
    expect(callArgs).toMatchObject({
      query: expect.anything(),
      defaultSortBy: 'name',
    });
    expect(typeof callArgs.extractPaginatedData).toBe('function');
    expect(typeof callArgs.filterItem).toBe('function');
    expect(typeof callArgs.getSortValue).toBe('function');
  });

  it('should extract paginated data correctly', () => {
    renderHook(() => usePositions());

    const callArgs = mockUsePaginatedQuery.mock.calls[0][0];
    const { extractPaginatedData } = callArgs;

    const mockData = {
      positions: {
        items: mockPositions,
        total: 3,
        page: 1,
        limit: 10,
        total_pages: 1,
      },
    };

    const result = extractPaginatedData(mockData);
    expect(result).toEqual(mockData.positions);
  });

  it('should return empty paginated response when data is invalid', () => {
    renderHook(() => usePositions());

    const callArgs = mockUsePaginatedQuery.mock.calls[0][0];
    const { extractPaginatedData } = callArgs;

    const invalidData = {} as PositionsQueryResponse;
    const result = extractPaginatedData(invalidData);
    expect(result).toEqual({
      items: [],
      total: 0,
      total_pages: 0,
    });
  });

  it('should filter positions by name correctly', () => {
    renderHook(() => usePositions());

    const callArgs = mockUsePaginatedQuery.mock.calls[0][0];
    const { filterItem } = callArgs;

    const position: Position = {
      id: '1',
      name: 'Frontend Developer',
      created_at: '2024-01-01T00:00:00Z',
    };
    expect(filterItem(position, 'frontend')).toBe(true);
    expect(filterItem(position, 'developer')).toBe(true);
    expect(filterItem(position, 'backend')).toBe(false);
  });

  it('should get sort value by name correctly', () => {
    renderHook(() => usePositions());

    const callArgs = mockUsePaginatedQuery.mock.calls[0][0];
    const { getSortValue } = callArgs;

    const position: Position = {
      id: '1',
      name: 'Frontend Developer',
      created_at: '2024-01-01T00:00:00Z',
    };

    expect(getSortValue(position, 'name')).toBe('Frontend Developer');
    expect(getSortValue(position, 'created_at')).toBe('');
  });

  it('should handle search state changes', () => {
    const setSearchMock = vi.fn();
    mockUsePaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      setSearch: setSearchMock,
    });

    const { result } = renderHook(() => usePositions());

    act(() => {
      result.current.setSearch('Frontend');
    });

    expect(setSearchMock).toHaveBeenCalledWith('Frontend');
  });

  it('should handle sort changes', () => {
    const handleSortMock = vi.fn();
    mockUsePaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      handleSort: handleSortMock,
    });

    const { result } = renderHook(() => usePositions());

    act(() => {
      result.current.handleSort('name');
    });

    expect(handleSortMock).toHaveBeenCalledWith('name');
  });

  it('should handle refresh', async () => {
    const refreshMock = vi.fn().mockResolvedValue(mockPositions);
    mockUsePaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      handleRefresh: refreshMock,
    });

    const { result } = renderHook(() => usePositions());

    let refreshedItems: Position[] | undefined;
    await act(async () => {
      refreshedItems = await result.current.handleRefresh();
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(refreshedItems).toEqual(mockPositions);
  });

  it('should handle pagination state changes', () => {
    const setCurrentPageMock = vi.fn();
    const setPageSizeMock = vi.fn();
    mockUsePaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      setCurrentPage: setCurrentPageMock,
      setPageSize: setPageSizeMock,
    });

    const { result } = renderHook(() => usePositions());

    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(setCurrentPageMock).toHaveBeenCalledWith(2);

    act(() => {
      result.current.setPageSize(20);
    });
    expect(setPageSizeMock).toHaveBeenCalledWith(20);
  });

  it('should handle loading state', () => {
    mockUsePaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      loading: true,
    });

    const { result } = renderHook(() => usePositions());
    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    mockUsePaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      error: true,
    });

    const { result } = renderHook(() => usePositions());
    expect(result.current.error).toBe(true);
  });
});
