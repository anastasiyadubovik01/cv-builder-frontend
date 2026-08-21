'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { POSITIONS_QUERY, type Position } from '@/api/positions';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

import { PositionsTable } from './PositionsTable';
import type { PositionSortField, SortDirection } from '../types';

export function PositionsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<PositionSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [allPositions, setAllPositions] = useState<Position[]>([]);
  const [loadError, setLoadError] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    POSITIONS_QUERY,
    {
      variables: {
        params: {
          page: 1,
          limit: BACKEND_PAGE_SIZE,
        },
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const loadAllPositions = useCallback(
    async (sourceData: NonNullable<typeof data>): Promise<Position[]> => {
      const firstPageItems = sourceData.positions.items;
      const totalBackendPages = sourceData.positions.total_pages;

      if (totalBackendPages <= 1) {
        return firstPageItems;
      }

      const pagesToLoad = Array.from(
        { length: totalBackendPages - 1 },
        (_, index) => index + 2,
      );

      const responses = await Promise.all(
        pagesToLoad.map((page) =>
          fetchMore({
            variables: {
              params: {
                page,
                limit: BACKEND_PAGE_SIZE,
              },
            },
          }),
        ),
      );

      const remainingItems = responses.flatMap(
        (response) => response.data.positions.items,
      );

      return [...firstPageItems, ...remainingItems];
    },
    [fetchMore],
  );

  useEffect(() => {
    if (!data) return;

    const syncPositions = async () => {
      try {
        const items = await loadAllPositions(data);

        setAllPositions(items);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    };

    void syncPositions();
  }, [data, loadAllPositions]);

  const handleRefresh = async () => {
    try {
      const result = await refetch();

      if (!result.data) return;

      const items = await loadAllPositions(result.data);

      setAllPositions(items);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredPositions = allPositions.filter((position) =>
    position.name.toLowerCase().includes(normalizedSearch),
  );

  const sortedPositions = [...filteredPositions].sort((a, b) =>
    sortDirection === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name),
  );

  const totalPages = Math.ceil(sortedPositions.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;

  const positions = sortedPositions.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: PositionSortField) => {
    if (sortBy === field) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));

      setCurrentPage(1);
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const hasError = Boolean(error) || loadError;

  const isLoading =
    loading || Boolean(data && allPositions.length < data.positions.total);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      {!hasError && isLoading && <LoadingOverlay />}

      <div className="mx-auto w-full max-w-[1190px] px-6">
        <div className="flex items-center justify-between pt-2 pb-4">
          <SearchInput
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('positions.search', 'Search')}
            className="bg-background"
          />
        </div>

        {hasError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">
              {t('positions.loadError', 'Failed to load positions')}
            </p>

            <Button type="button" onClick={() => void handleRefresh()}>
              {t('retry', 'Retry')}
            </Button>
          </div>
        ) : (
          <>
            <PositionsTable
              positions={positions}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              onEdit={() => {}}
              onDelete={() => {}}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
