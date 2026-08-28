import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useClientSortAndFilter } from './useClientSortAndFilter';
import { useFetchAllPages } from './useFetchAllPages';
import { usePaginatedQuery } from './usePaginatedQuery';
import { usePaginationState } from './usePaginationState';

vi.mock('./usePaginationState', () => ({
  usePaginationState: vi.fn(),
}));

vi.mock('./useFetchAllPages', () => ({
  useFetchAllPages: vi.fn(),
}));

vi.mock('./useClientSortAndFilter', () => ({
  useClientSortAndFilter: vi.fn(),
}));

type Item = {
  id: number;
  name: string;
};

type SortField = 'name';

const items: Item[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const query = {} as never;

const extractPaginatedData = vi.fn();

describe('usePaginatedQuery', () => {
  const setCurrentPage = vi.fn();
  const setPageSize = vi.fn();
  const resetPagination = vi.fn();
  const refetchAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePaginationState).mockReturnValue({
      currentPage: 1,
      pageSize: 10,
      setCurrentPage,
      setPageSize,
      resetPagination,
    });

    vi.mocked(useFetchAllPages).mockReturnValue({
      allItems: items,
      loading: false,
      error: false,
      refetchAll,
    });

    vi.mocked(useClientSortAndFilter).mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      sortBy: 'name',
      sortDirection: 'asc',
      handleSort: vi.fn(),
      sortedItems: items,
    });
  });

  it('passes correct options to child hooks', () => {
    renderHook(() =>
      usePaginatedQuery<unknown, Record<string, unknown>, Item, SortField>({
        query,
        extractPaginatedData,
        defaultSortBy: 'name',
      }),
    );

    expect(useFetchAllPages).toHaveBeenCalledWith({
      query,
      variables: undefined,
      skip: false,
      extractPaginatedData,
    });

    expect(useClientSortAndFilter).toHaveBeenCalledWith(
      expect.objectContaining({
        items,
        defaultSortBy: 'name',
        defaultSortDirection: 'asc',
        onStateChange: resetPagination,
      }),
    );
  });

  it('calculates total pages', () => {
    const { result } = renderHook(() =>
      usePaginatedQuery<unknown, Record<string, unknown>, Item, SortField>({
        query,
        extractPaginatedData,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.totalPages).toBe(3);
  });

  it('returns items for the current page', () => {
    vi.mocked(usePaginationState).mockReturnValue({
      currentPage: 2,
      pageSize: 10,
      setCurrentPage,
      setPageSize,
      resetPagination,
    });

    const { result } = renderHook(() =>
      usePaginatedQuery<unknown, Record<string, unknown>, Item, SortField>({
        query,
        extractPaginatedData,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.paginatedItems).toEqual(items.slice(10, 20));
  });

  it('limits current page to the last available page', () => {
    vi.mocked(usePaginationState).mockReturnValue({
      currentPage: 5,
      pageSize: 10,
      setCurrentPage,
      setPageSize,
      resetPagination,
    });

    const { result } = renderHook(() =>
      usePaginatedQuery<unknown, Record<string, unknown>, Item, SortField>({
        query,
        extractPaginatedData,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.currentPage).toBe(3);
    expect(setCurrentPage).toHaveBeenCalledWith(3);
  });

  it('returns at least one total page when there are no items', () => {
    vi.mocked(useClientSortAndFilter).mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      sortBy: 'name',
      sortDirection: 'asc',
      handleSort: vi.fn(),
      sortedItems: [],
    });

    const { result } = renderHook(() =>
      usePaginatedQuery<unknown, Record<string, unknown>, Item, SortField>({
        query,
        extractPaginatedData,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.totalPages).toBe(1);
    expect(result.current.paginatedItems).toEqual([]);
  });

  it('returns loading, error and refresh from useFetchAllPages', () => {
    vi.mocked(useFetchAllPages).mockReturnValue({
      allItems: items,
      loading: true,
      error: true,
      refetchAll,
    });

    const { result } = renderHook(() =>
      usePaginatedQuery<unknown, Record<string, unknown>, Item, SortField>({
        query,
        extractPaginatedData,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(true);
    expect(result.current.handleRefresh).toBe(refetchAll);
  });
});
