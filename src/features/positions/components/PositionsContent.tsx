'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { POSITIONS_QUERY, type Position } from '@/api/positions';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

import { CreatePositionModal } from './CreatePositionModal';
import { DeletePositionModal } from './DeletePositionModal';
import { PositionsTable } from './PositionsTable';
import { UpdatePositionModal } from './UpdatePositionModal';
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

  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(
    null,
  );

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
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      {!hasError && isLoading && <LoadingOverlay />}

      <div className="mx-6 mt-[7px] flex shrink-0 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('positions.search', 'Search')}
          className="bg-background"
        />

        <CreatePositionModal
          positions={allPositions}
          onSuccess={handleRefresh}
          trigger={
            <Button
              type="button"
              variant="primaryV2"
              className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
            >
              <PlusIcon className="size-6" />

              <span className="hidden lg:inline">
                {t('positions.create', 'Create position')}
              </span>
            </Button>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4">
        {hasError ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">
              {t('positions.loadError', 'Failed to load positions')}
            </p>

            <Button type="button" onClick={() => void handleRefresh()}>
              {t('retry', 'Retry')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              <PositionsTable
                positions={positions}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={setEditingPosition}
                onDelete={setDeletingPosition}
              />
            </div>

            <div className="shrink-0 bg-background pb-4">
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
            </div>

            {editingPosition && (
              <UpdatePositionModal
                position={editingPosition}
                positions={allPositions}
                open={Boolean(editingPosition)}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingPosition(null);
                  }
                }}
                onSuccess={async () => {
                  await handleRefresh();
                  setEditingPosition(null);
                }}
              />
            )}

            {deletingPosition && (
              <DeletePositionModal
                positionId={deletingPosition.id}
                name={deletingPosition.name}
                open={Boolean(deletingPosition)}
                onOpenChange={(open) => {
                  if (!open) {
                    setDeletingPosition(null);
                  }
                }}
                onSuccess={async () => {
                  await handleRefresh();
                  setDeletingPosition(null);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
