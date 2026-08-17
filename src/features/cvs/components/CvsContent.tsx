'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client/react';
import { CVS_QUERY } from '@/api/cvs';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { CvsTable } from '@/features/cvs/components/CvsTable';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';
import { CreateCvModal } from '@/features/cvs/components/modals/CreateCvModal';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import type { ApiCv } from '@/api/cvs';
import type { Cv, SortDirection, SortField } from '@/features/cvs/types';

export function CvsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [allCvs, setAllCvs] = useState<ApiCv[]>([]);
  const [loadError, setLoadError] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useQuery(CVS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: BACKEND_PAGE_SIZE,
      },
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const loadAllCvs = async () => {
      try {
        setLoadError(false);

        const firstPageCvs = data.cvs.items;
        const totalBackendPages = data.cvs.total_pages;

        if (totalBackendPages <= 1) {
          setAllCvs(firstPageCvs);
          return;
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

        const remainingCvs = responses.flatMap(
          (response) => response.data.cvs.items,
        );

        setAllCvs([...firstPageCvs, ...remainingCvs]);
      } catch {
        setLoadError(true);
      }
    };

    void loadAllCvs();
  }, [data, fetchMore]);

  const cvs: Cv[] = allCvs.map((cv) => ({
    id: cv.id,
    name: cv.name,
    education: cv.education ?? '',
    employee: cv.user?.email ?? '',
    description: cv.description,
  }));

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCvs = cvs.filter((cv) => {
    return (
      cv.name.toLowerCase().includes(normalizedSearch) ||
      cv.education.toLowerCase().includes(normalizedSearch) ||
      cv.employee.toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedCvs = [...filteredCvs].sort((a, b) => {
    const firstValue = a[sortBy].trim();
    const secondValue = b[sortBy].trim();

    if (!firstValue && !secondValue) return 0;
    if (!firstValue) return 1;
    if (!secondValue) return -1;

    return sortDirection === 'asc'
      ? firstValue.localeCompare(secondValue)
      : secondValue.localeCompare(firstValue);
  });

  const totalPages = Math.ceil(sortedCvs.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCvs = sortedCvs.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setCurrentPage(1);
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const handleRetry = async () => {
    setLoadError(false);

    try {
      await refetch();
    } catch {
      setLoadError(true);
    }
  };

  const hasError = Boolean(error) || loadError;
  const isLoading = loading || Boolean(data && allCvs.length < data.cvs.total);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      {!hasError && isLoading && <LoadingOverlay />}
      <div className="mx-6 mt-[7px] flex items-center justify-between shrink-0">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('cvs.search', 'Search')}
          className="bg-background"
        />
        <CreateCvModal
          trigger={
            <Button
              type="button"
              className="flex items-center gap-2 uppercase font-medium text-[14px]"
              variant="primaryV2"
            >
              <PlusIcon className="size-6" />
              {t('cvs.createCv', 'CREATE CV')}
            </Button>
          }
          onSubmit={(data) => {
            // mock submit
            console.log('New CV Data:', data);
            void refetch();
          }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        {hasError ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">
              {t('cvs.loadError', 'Failed to load CVs')}
            </p>
            <Button type="button" onClick={() => void handleRetry()}>
              {t('retry', 'Retry')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CvsTable
                cvs={paginatedCvs}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
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
          </>
        )}
      </div>
    </div>
  );
}
