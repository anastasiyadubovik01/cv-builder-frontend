'use client';

import { useTranslation } from 'react-i18next';

import type { ApiDepartment } from '@/api/departments';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import type { DepartmentSortField, SortDirection } from '../types';

type DepartmentsTableProps = {
  departments: ApiDepartment[];
  sortBy: DepartmentSortField;
  sortDirection: SortDirection;
  onSort: (field: DepartmentSortField) => void;
};

export function DepartmentsTable({
  departments,
  sortBy,
  sortDirection,
  onSort,
}: DepartmentsTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<ApiDepartment, DepartmentSortField>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: t('departments.name', 'Name'),
      render: (department) => department.name,
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
