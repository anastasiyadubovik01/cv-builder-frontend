'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  POSITIONS_QUERY,
  type Position,
  type PositionsQueryResponse,
} from '@/api/positions';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import { CreatePositionModal } from './CreatePositionModal';
import { DeletePositionModal } from './DeletePositionModal';
import { PositionsTable } from './PositionsTable';
import { UpdatePositionModal } from './UpdatePositionModal';
import type { PositionSortField } from '../types';

export function PositionsContent() {
  const { t } = useTranslation();

  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(
    null,
  );

  const extractPaginatedData = useCallback((data: PositionsQueryResponse) => {
    if ('positions' in data && data.positions) {
      return data.positions;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((position: Position, queryStr: string) => {
    return position.name.toLowerCase().includes(queryStr);
  }, []);

  const getSortValue = useCallback(
    (position: Position, field: PositionSortField) => {
      switch (field) {
        case 'name':
          return position.name;
        default:
          return '';
      }
    },
    [],
  );

  const {
    paginatedItems: positions,
    allItems: allPositions,
    loading,
    error,
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    handleRefresh,
  } = usePaginatedQuery<
    PositionsQueryResponse,
    Record<string, unknown>,
    Position,
    PositionSortField
  >({
    query: POSITIONS_QUERY,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('positions.loadError', 'Failed to load positions')}
      onRetry={handleRefresh}
      search={search}
      onSearchChange={setSearch}
      actionTrigger={
        <CreatePositionModal
          positions={allPositions}
          onSuccess={() => void handleRefresh()}
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
      }
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
    >
      <PositionsTable
        positions={positions}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={setEditingPosition}
        onDelete={setDeletingPosition}
      />

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
    </ContentLayout>
  );
}
