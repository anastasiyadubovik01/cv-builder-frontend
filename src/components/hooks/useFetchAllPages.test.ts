import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuery } from '@apollo/client/react';

import { BACKEND_PAGE_SIZE } from '@/lib/constants/pagination';

import {
  getEmptyPaginatedResponse,
  useFetchAllPages,
} from './useFetchAllPages';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}));

type Item = {
  id: number;
};

type TestData = {
  itemsPage: {
    items: Item[];
    total: number;
    total_pages: number;
  };
};

const query = {} as never;

const extractPaginatedData = (data: TestData) => data.itemsPage;

describe('useFetchAllPages', () => {
  const fetchMore = vi.fn();
  const refetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
      fetchMore,
      refetch,
    } as never);
  });

  it('returns an empty paginated response', () => {
    expect(getEmptyPaginatedResponse<Item>()).toEqual({
      items: [],
      total: 0,
      total_pages: 0,
    });
  });

  it('requests the first backend page with backend page size', () => {
    renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    expect(useQuery).toHaveBeenCalledWith(query, {
      variables: {
        params: {
          page: 1,
          limit: BACKEND_PAGE_SIZE,
        },
      },
      fetchPolicy: 'cache-and-network',
      skip: false,
    });
  });

  it('loads items from a single backend page without fetchMore', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }, { id: 2 }],
        total: 2,
        total_pages: 1,
      },
    };

    vi.mocked(useQuery).mockReturnValue({
      data: firstPage,
      loading: false,
      error: undefined,
      fetchMore,
      refetch,
    } as never);

    const { result } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    await waitFor(() => {
      expect(result.current.allItems).toEqual([{ id: 1 }, { id: 2 }]);
    });

    expect(fetchMore).not.toHaveBeenCalled();
  });

  it('loads remaining backend pages and combines all items', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 3,
        total_pages: 3,
      },
    };

    const secondPage: TestData = {
      itemsPage: {
        items: [{ id: 2 }],
        total: 3,
        total_pages: 3,
      },
    };

    const thirdPage: TestData = {
      itemsPage: {
        items: [{ id: 3 }],
        total: 3,
        total_pages: 3,
      },
    };

    fetchMore
      .mockResolvedValueOnce({ data: secondPage })
      .mockResolvedValueOnce({ data: thirdPage });

    vi.mocked(useQuery).mockReturnValue({
      data: firstPage,
      loading: false,
      error: undefined,
      fetchMore,
      refetch,
    } as never);

    const { result } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    await waitFor(() => {
      expect(result.current.allItems).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
    });

    expect(fetchMore).toHaveBeenCalledTimes(2);

    expect(fetchMore).toHaveBeenNthCalledWith(1, {
      variables: {
        params: {
          page: 2,
          limit: BACKEND_PAGE_SIZE,
        },
      },
    });

    expect(fetchMore).toHaveBeenNthCalledWith(2, {
      variables: {
        params: {
          page: 3,
          limit: BACKEND_PAGE_SIZE,
        },
      },
    });
  });

  it('returns loading state from Apollo', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      fetchMore,
      refetch,
    } as never);

    const { result } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    expect(result.current.loading).toBe(true);
  });

  it('returns error when Apollo query fails', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Failed'),
      fetchMore,
      refetch,
    } as never);

    const { result } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    expect(result.current.error).toBe(true);
  });

  it('returns error when loading remaining pages fails', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 2,
        total_pages: 2,
      },
    };

    fetchMore.mockRejectedValue(new Error('Failed'));

    vi.mocked(useQuery).mockReturnValue({
      data: firstPage,
      loading: false,
      error: undefined,
      fetchMore,
      refetch,
    } as never);

    const { result } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toBe(true);
    });

    expect(result.current.loading).toBe(false);
  });

  it('refetches and updates all items', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 1,
        total_pages: 1,
      },
    };

    const refreshedPage: TestData = {
      itemsPage: {
        items: [{ id: 10 }, { id: 20 }],
        total: 2,
        total_pages: 1,
      },
    };

    refetch.mockResolvedValue({
      data: refreshedPage,
    });

    vi.mocked(useQuery).mockReturnValue({
      data: firstPage,
      loading: false,
      error: undefined,
      fetchMore,
      refetch,
    } as never);

    const { result } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    await waitFor(() => {
      expect(result.current.allItems).toEqual([{ id: 1 }]);
    });

    let refreshedItems: Item[] | undefined;

    await act(async () => {
      refreshedItems = await result.current.refetchAll();
    });

    expect(refetch).toHaveBeenCalledTimes(1);

    expect(refreshedItems).toEqual([{ id: 10 }, { id: 20 }]);

    expect(result.current.allItems).toEqual([{ id: 10 }, { id: 20 }]);
  });
});
