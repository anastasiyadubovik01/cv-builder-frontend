'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import type { ApiDepartment } from '@/api/departments';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';

import type { DepartmentSortField, SortDirection } from '../types';

type DepartmentsTableProps = {
  departments: ApiDepartment[];
  sortBy: DepartmentSortField;
  sortDirection: SortDirection;
  onSort: (field: DepartmentSortField) => void;
  onEdit: (department: ApiDepartment) => void;
  onDelete: (department: ApiDepartment) => void;
};

export function DepartmentsTable({
  departments,
  sortBy,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: DepartmentsTableProps) {
  const { t } = useTranslation();

  const [openMenuDepartmentId, setOpenMenuDepartmentId] = useState<
    string | null
  >(null);

  const columns: DataTableColumn<ApiDepartment, DepartmentSortField>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: t('departments.name', 'Name'),
      render: (department) => department.name,
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (department) => (
        <RowActionsMenu
          open={openMenuDepartmentId === department.id}
          onOpenChange={(open) =>
            setOpenMenuDepartmentId(open ? department.id : null)
          }
          ariaLabel={`Actions for ${department.name}`}
          actions={[
            {
              label: t('dialogs.actions.edit'),
              onClick: () => onEdit(department),
            },
            {
              label: t('dialogs.actions.delete'),
              onClick: () => onDelete(department),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={departments}
      columns={columns}
      getRowKey={(department) => department.id}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyState={t('departments.empty', 'No departments found')}
    />
  );
}
