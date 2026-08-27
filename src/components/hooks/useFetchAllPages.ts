'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DocumentNode, OperationVariables } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { BACKEND_PAGE_SIZE } from '@/lib/constants/pagination';

export interface PaginatedBackendResponse<TItem> {
  items: TItem[];
  total: number;
  total_pages: number;
}

export function getEmptyPaginatedResponse<
  TItem,
>(): PaginatedBackendResponse<TItem> {
  return { items: [], total: 0, total_pages: 0 };
}

export interface UseFetchAllPagesOptions<
  TData,
  TVariables extends OperationVariables,
  TItem,
> {
  query: DocumentNode;
  variables?: TVariables;
  skip?: boolean;
  extractPaginatedData: (data: TData) => PaginatedBackendResponse<TItem>;
}

export interface UseFetchAllPagesResult<TItem> {
  allItems: TItem[];
  loading: boolean;
  error: boolean;
  refetchAll: () => Promise<TItem[] | undefined>;
}

export function useFetchAllPages<
  TData,
  TVariables extends OperationVariables,
  TItem,
>({
  query,
  variables,
  skip = false,
  extractPaginatedData,
}: UseFetchAllPagesOptions<
  TData,
  TVariables,
  TItem
>): UseFetchAllPagesResult<TItem> {
  const [allItems, setAllItems] = useState<TItem[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const buildPagedVariables = useCallback(
    (page: number) =>
      ({
        ...variables,
        params: {
          ...(variables?.params as object | undefined),
          page,
          limit: BACKEND_PAGE_SIZE,
        },
      }) as unknown as TVariables,
    [variables],
  );

  const queryVariables = useMemo(
    () => buildPagedVariables(1),
    [buildPagedVariables],
  );

  const { data, loading, error, fetchMore, refetch } = useQuery<
    TData,
    TVariables
  >(query, {
    variables: queryVariables,
    fetchPolicy: 'cache-and-network',
    skip,
  });

  const loadAllPages = useCallback(
    async (sourceData: NonNullable<TData>): Promise<TItem[]> => {
      const paginated = extractPaginatedData(sourceData);
      const firstPageItems = paginated.items ?? [];
      const totalBackendPages = paginated.total_pages ?? 0;

      if (totalBackendPages <= 1) {
        return firstPageItems;
      }

      const pagesToLoad = Array.from(
        { length: totalBackendPages - 1 },
        (_, index) => index + 2,
      );

      const responses = await Promise.all(
        pagesToLoad.map((page) => {
          return fetchMore({
            variables: buildPagedVariables(page),
          });
        }),
      );

      const remainingItems = responses.flatMap((response) => {
        if (!response.data) return [];
        return extractPaginatedData(response.data).items ?? [];
      });

      return [...firstPageItems, ...remainingItems];
    },
    [fetchMore, extractPaginatedData, buildPagedVariables],
  );

  useEffect(() => {
    if (!data) return;

    let isMounted = true;

    const fetchRemaining = async () => {
      try {
        const paginated = extractPaginatedData(data);
        const totalBackendPages = paginated.total_pages ?? 0;
        if (totalBackendPages > 1) {
          setIsFetchingMore(true);
        }

        const items = await loadAllPages(data);
        if (isMounted) {
          setAllItems(items);
          setLoadError(false);
        }
      } catch {
        if (isMounted) {
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsFetchingMore(false);
        }
      }
    };

    void fetchRemaining();

    return () => {
      isMounted = false;
    };
  }, [data, loadAllPages, extractPaginatedData]);

  const refetchAll = async (): Promise<TItem[] | undefined> => {
    try {
      setIsFetchingMore(true);
      const result = await refetch();
      if (!result.data) {
        setIsFetchingMore(false);
        return undefined;
      }

      const items = await loadAllPages(result.data);
      setAllItems(items);
      setLoadError(false);
      setIsFetchingMore(false);
      return items;
    } catch {
      setLoadError(true);
      setIsFetchingMore(false);
      return undefined;
    }
  };

  const hasError = Boolean(error) || loadError;
  const isInitialOrLoadingPages = loading || isFetchingMore;

  return {
    allItems,
    loading: isInitialOrLoadingPages,
    error: hasError,
    refetchAll,
  };
}
