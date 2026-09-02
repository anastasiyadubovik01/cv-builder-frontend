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

  it('preserves existing variables and params', () => {
    renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        variables: {
          userId: 'user-1',
          params: {
            search: 'react',
          },
        },
        extractPaginatedData,
      }),
    );

    expect(useQuery).toHaveBeenCalledWith(query, {
      variables: {
        userId: 'user-1',
        params: {
          search: 'react',
          page: 1,
          limit: BACKEND_PAGE_SIZE,
        },
      },
      fetchPolicy: 'cache-and-network',
      skip: false,
    });
  });

  it('passes skip to Apollo query', () => {
    renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        skip: true,
        extractPaginatedData,
      }),
    );

    expect(useQuery).toHaveBeenCalledWith(
      query,
      expect.objectContaining({
        skip: true,
      }),
    );
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

  it('uses empty items when first page items are missing', async () => {
    const firstPage = {
      itemsPage: {
        items: undefined,
        total: 0,
        total_pages: 1,
      },
    } as unknown as TestData;

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
      expect(result.current.allItems).toEqual([]);
    });

    expect(fetchMore).not.toHaveBeenCalled();
  });

  it('treats missing total_pages as zero', async () => {
    const firstPage = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 1,
        total_pages: undefined,
      },
    } as unknown as TestData;

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

    expect(fetchMore).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
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
      .mockResolvedValueOnce({
        data: secondPage,
      })
      .mockResolvedValueOnce({
        data: thirdPage,
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

  it('ignores fetchMore response without data', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 2,
        total_pages: 2,
      },
    };

    fetchMore.mockResolvedValue({
      data: undefined,
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

    expect(fetchMore).toHaveBeenCalledTimes(1);
  });

  it('uses empty items when fetched page items are missing', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 2,
        total_pages: 2,
      },
    };

    const secondPage = {
      itemsPage: {
        items: undefined,
        total: 2,
        total_pages: 2,
      },
    } as unknown as TestData;

    fetchMore.mockResolvedValue({
      data: secondPage,
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

  it('returns loading while remaining pages are loading', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 2,
        total_pages: 2,
      },
    };

    let resolveFetchMore: ((value: { data: TestData }) => void) | undefined;

    const fetchMorePromise = new Promise<{
      data: TestData;
    }>((resolve) => {
      resolveFetchMore = resolve;
    });

    fetchMore.mockReturnValue(fetchMorePromise);

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
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolveFetchMore?.({
        data: {
          itemsPage: {
            items: [{ id: 2 }],
            total: 2,
            total_pages: 2,
          },
        },
      });

      await fetchMorePromise;
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
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

  it('does not update state when loading completes after unmount', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 2,
        total_pages: 2,
      },
    };

    let resolveFetchMore: ((value: { data: TestData }) => void) | undefined;

    const fetchMorePromise = new Promise<{
      data: TestData;
    }>((resolve) => {
      resolveFetchMore = resolve;
    });

    fetchMore.mockReturnValue(fetchMorePromise);

    vi.mocked(useQuery).mockReturnValue({
      data: firstPage,
      loading: false,
      error: undefined,
      fetchMore,
      refetch,
    } as never);

    const { unmount } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    await waitFor(() => {
      expect(fetchMore).toHaveBeenCalledTimes(1);
    });

    unmount();

    await act(async () => {
      resolveFetchMore?.({
        data: {
          itemsPage: {
            items: [{ id: 2 }],
            total: 2,
            total_pages: 2,
          },
        },
      });

      await fetchMorePromise;
      await Promise.resolve();
    });
  });

  it('does not update error state when loading fails after unmount', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 2,
        total_pages: 2,
      },
    };

    let rejectFetchMore: ((error: Error) => void) | undefined;

    const fetchMorePromise = new Promise<never>((_, reject) => {
      rejectFetchMore = reject;
    });

    fetchMore.mockReturnValue(fetchMorePromise);

    vi.mocked(useQuery).mockReturnValue({
      data: firstPage,
      loading: false,
      error: undefined,
      fetchMore,
      refetch,
    } as never);

    const { unmount } = renderHook(() =>
      useFetchAllPages<TestData, Record<string, unknown>, Item>({
        query,
        extractPaginatedData,
      }),
    );

    await waitFor(() => {
      expect(fetchMore).toHaveBeenCalledTimes(1);
    });

    unmount();

    await act(async () => {
      rejectFetchMore?.(new Error('Fetch failed'));

      await Promise.resolve();
      await Promise.resolve();
    });
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

  it('refetches all backend pages', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 1,
        total_pages: 1,
      },
    };

    const refreshedFirstPage: TestData = {
      itemsPage: {
        items: [{ id: 10 }],
        total: 2,
        total_pages: 2,
      },
    };

    const refreshedSecondPage: TestData = {
      itemsPage: {
        items: [{ id: 20 }],
        total: 2,
        total_pages: 2,
      },
    };

    refetch.mockResolvedValue({
      data: refreshedFirstPage,
    });

    fetchMore.mockResolvedValue({
      data: refreshedSecondPage,
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

    expect(refreshedItems).toEqual([{ id: 10 }, { id: 20 }]);

    expect(fetchMore).toHaveBeenCalledWith({
      variables: {
        params: {
          page: 2,
          limit: BACKEND_PAGE_SIZE,
        },
      },
    });
  });

  it('returns undefined when refetch returns no data', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 1,
        total_pages: 1,
      },
    };

    refetch.mockResolvedValue({
      data: undefined,
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

    expect(refreshedItems).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });

  it('returns undefined and sets error when refetch fails', async () => {
    const firstPage: TestData = {
      itemsPage: {
        items: [{ id: 1 }],
        total: 1,
        total_pages: 1,
      },
    };

    refetch.mockRejectedValue(new Error('Refetch failed'));

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

    expect(refreshedItems).toBeUndefined();
    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
