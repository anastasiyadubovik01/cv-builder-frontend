'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { useDepartments } from '@/features/departments/hooks/useDepartments';

import { CreateDepartmentModal } from './CreateDepartmentModal';
import { DepartmentsTable } from './DepartmentsTable';
import { UpdateDepartmentModal } from './UpdateDepartmentModal';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';

import type { ApiDepartment } from '@/api/departments';

export function DepartmentsContent() {
  const { t } = useTranslation();

  const [editingDepartment, setEditingDepartment] =
    useState<ApiDepartment | null>(null);

  const [deletingDepartment, setDeletingDepartment] =
    useState<ApiDepartment | null>(null);

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
  } = useDepartments();

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
        onEdit={setEditingDepartment}
        onDelete={setDeletingDepartment}
      />

      {editingDepartment && (
        <UpdateDepartmentModal
          department={editingDepartment}
          departments={allDepartments}
          open
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
          open
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
