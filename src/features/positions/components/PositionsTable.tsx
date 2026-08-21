'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Position } from '@/api/positions';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';

import type { PositionSortField, SortDirection } from '../types';

type PositionsTableProps = {
  positions: Position[];
  sortBy: PositionSortField;
  sortDirection: SortDirection;
  onSort: (field: PositionSortField) => void;
  onEdit: (position: Position) => void;
  onDelete: (position: Position) => void;
};

export function PositionsTable({
  positions,
  sortBy,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: PositionsTableProps) {
  const { t } = useTranslation();

  const [openMenuPositionId, setOpenMenuPositionId] = useState<string | null>(
    null,
  );

  const columns: DataTableColumn<Position, PositionSortField>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: t('positions.name', 'Name'),
      render: (position) => position.name,
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (position) => (
        <RowActionsMenu
          open={openMenuPositionId === position.id}
          onOpenChange={(open) =>
            setOpenMenuPositionId(open ? position.id : null)
          }
          ariaLabel={`Actions for ${position.name}`}
          actions={[
            {
              label: t('dialogs.actions.edit'),
              onClick: () => onEdit(position),
            },
            {
              label: t('dialogs.actions.delete'),
              onClick: () => onDelete(position),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={positions}
      columns={columns}
      getRowKey={(position) => position.id}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyState={t('positions.empty', 'No positions found')}
    />
  );
}
