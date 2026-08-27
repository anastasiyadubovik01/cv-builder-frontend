'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEPARTMENTS_QUERY,
  type ApiDepartment,
  type DepartmentsQueryData,
} from '@/api/departments';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';

import { CreateDepartmentModal } from './CreateDepartmentModal';
import { DepartmentsTable } from './DepartmentsTable';
import { UpdateDepartmentModal } from './UpdateDepartmentModal';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';

import type { DepartmentSortField } from '../types';

export function DepartmentsContent() {
  const { t } = useTranslation();

  const [editingDepartment, setEditingDepartment] =
    useState<ApiDepartment | null>(null);

  const [deletingDepartment, setDeletingDepartment] =
    useState<ApiDepartment | null>(null);

  const extractPaginatedData = useCallback((data: DepartmentsQueryData) => {
    if ('departments' in data && data.departments) {
      return data.departments;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback(
    (department: ApiDepartment, queryStr: string) => {
      return department.name.toLowerCase().includes(queryStr);
    },
    [],
  );

  const getSortValue = useCallback(
    (department: ApiDepartment, field: DepartmentSortField) => {
      switch (field) {
        case 'name':
          return department.name;
        default:
          return '';
      }
    },
    [],
  );

  const {
    paginatedItems: departments,
    allItems: allDepartments,
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
    DepartmentsQueryData,
    Record<string, unknown>,
    ApiDepartment,
    DepartmentSortField
  >({
    query: DEPARTMENTS_QUERY,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });

  const handleEdit = (department: ApiDepartment) => {
    setEditingDepartment(department);
  };

  const handleDelete = (department: ApiDepartment) => {
    setDeletingDepartment(department);
  };

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('departments.loadError', 'Failed to load departments')}
      onRetry={handleRefresh}
      search={search}
      onSearchChange={setSearch}
      actionTrigger={
        <CreateDepartmentModal
          departments={allDepartments}
          onSuccess={() => void handleRefresh()}
          trigger={
            <Button
              type="button"
              variant="primaryV2"
              className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
            >
              <PlusIcon className="size-6" />
              <span className="hidden lg:inline">
                {t('departments.create', 'CREATE DEPARTMENT')}
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
      <DepartmentsTable
        departments={departments}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingDepartment && (
        <UpdateDepartmentModal
          department={editingDepartment}
          departments={allDepartments}
          open={Boolean(editingDepartment)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingDepartment(null);
            }
          }}
          onSuccess={async () => {
            await handleRefresh();
            setEditingDepartment(null);
          }}
        />
      )}

      {deletingDepartment && (
        <DeleteDepartmentModal
          departmentId={deletingDepartment.id}
          name={deletingDepartment.name}
          open={Boolean(deletingDepartment)}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingDepartment(null);
            }
          }}
          onSuccess={async () => {
            await handleRefresh();
            setDeletingDepartment(null);
          }}
        />
      )}
    </ContentLayout>
  );
}
