'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { usePositions } from '@/features/positions/hooks/usePositions';

import { CreatePositionModal } from './CreatePositionModal';
import { DeletePositionModal } from './DeletePositionModal';
import { PositionsTable } from './PositionsTable';
import { UpdatePositionModal } from './UpdatePositionModal';

import type { Position } from '@/api/positions';

export function PositionsContent() {
  const { t } = useTranslation();

  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(
    null,
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
  } = usePositions();

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
