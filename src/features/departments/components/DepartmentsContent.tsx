'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';

import { DEPARTMENTS_QUERY, type ApiDepartment } from '@/api/departments';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

import { CreateDepartmentModal } from './CreateDepartmentModal';
import { DepartmentsTable } from './DepartmentsTable';
import { UpdateDepartmentModal } from './UpdateDepartmentModal';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';

import type { DepartmentSortField, SortDirection } from '../types';

export function DepartmentsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<DepartmentSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [allDepartments, setAllDepartments] = useState<ApiDepartment[]>([]);
  const [loadError, setLoadError] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState<ApiDepartment | null>(null);

  const [deletingDepartment, setDeletingDepartment] =
    useState<ApiDepartment | null>(null);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    DEPARTMENTS_QUERY,
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

  const loadAllDepartments = useCallback(
    async (sourceData: NonNullable<typeof data>): Promise<ApiDepartment[]> => {
      const firstPageItems = sourceData.departments.items;
      const totalBackendPages = sourceData.departments.total_pages;

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
        (response) => response.data.departments.items,
      );

      return [...firstPageItems, ...remainingItems];
    },
    [fetchMore],
  );

  useEffect(() => {
    if (!data) return;

    const syncDepartments = async () => {
      try {
        const items = await loadAllDepartments(data);

        setAllDepartments(items);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    };

    void syncDepartments();
  }, [data, loadAllDepartments]);

  const handleRefresh = async () => {
    try {
      const result = await refetch();

      if (!result.data) return;

      const items = await loadAllDepartments(result.data);

      setAllDepartments(items);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredDepartments = allDepartments.filter((department) =>
    department.name.toLowerCase().includes(normalizedSearch),
  );

  const sortedDepartments = [...filteredDepartments].sort((a, b) =>
    sortDirection === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name),
  );

  const totalPages = Math.ceil(sortedDepartments.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;

  const departments = sortedDepartments.slice(
    startIndex,
    startIndex + pageSize,
  );

  const handleSort = (field: DepartmentSortField) => {
    if (sortBy === field) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      setCurrentPage(1);
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const handleEdit = (department: ApiDepartment) => {
    setEditingDepartment(department);
  };

  const handleDelete = (department: ApiDepartment) => {
    setDeletingDepartment(department);
  };

  const hasError = Boolean(error) || loadError;

  const isLoading =
    loading || Boolean(data && allDepartments.length < data.departments.total);

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
            placeholder={t('departments.search', 'Search')}
            className="bg-background"
          />

          <CreateDepartmentModal
            departments={allDepartments}
            onSuccess={handleRefresh}
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
        </div>

        {hasError ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">
              {t('departments.loadError', 'Failed to load departments')}
            </p>

            <Button type="button" onClick={() => void handleRefresh()}>
              {t('retry', 'Retry')}
            </Button>
          </div>
        ) : (
          <>
            <DepartmentsTable
              departments={departments}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
          </>
        )}
      </div>
    </div>
  );
}
