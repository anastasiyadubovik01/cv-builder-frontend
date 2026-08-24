'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client/react';
import {
  CVS_BY_USER_ID_QUERY,
  CVS_QUERY,
  type ApiCv,
  type CvsData,
  type CvsByUserIdData,
} from '@/api/cvs';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { CvsTable } from '@/features/cvs/components/CvsTable';
import { CreateCvModal } from '@/features/cvs/components/modals/CreateCvModal';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';
import type { Cv, SortDirection, SortField } from '@/features/cvs/types';

interface CvsContentProps {
  isAdmin?: boolean;
  userId?: string;
  currentUserId?: string;
}

export function CvsContent({
  isAdmin = false,
  userId,
  currentUserId,
}: CvsContentProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [allCvs, setAllCvs] = useState<ApiCv[]>([]);
  const [loadError, setLoadError] = useState(false);

  const targetUserId = userId || currentUserId;
  const isUserSpecific = Boolean(userId);

  const globalQueryResult = useQuery<CvsData>(CVS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: BACKEND_PAGE_SIZE,
      },
    },
    fetchPolicy: 'cache-and-network',
    skip: isUserSpecific,
  });

  const userQueryResult = useQuery<CvsByUserIdData>(CVS_BY_USER_ID_QUERY, {
    variables: {
      userId: userId ?? '',
      params: {
        page: 1,
        limit: BACKEND_PAGE_SIZE,
      },
    },
    fetchPolicy: 'cache-and-network',
    skip: !isUserSpecific,
  });

  const activeQueryResult = isUserSpecific
    ? userQueryResult
    : globalQueryResult;
  const { data, loading, error, fetchMore, refetch } = activeQueryResult;

  const loadAllCvs = useCallback(
    async (sourceData: CvsData | CvsByUserIdData): Promise<ApiCv[]> => {
      let items: ApiCv[] = [];
      let totalBackendPages = 0;

      if ('cvsByUserId' in sourceData && sourceData.cvsByUserId) {
        items = sourceData.cvsByUserId.items;
        totalBackendPages = sourceData.cvsByUserId.total_pages;
      } else if ('cvs' in sourceData && sourceData.cvs) {
        items = sourceData.cvs.items;
        totalBackendPages = sourceData.cvs.total_pages;
      }

      if (totalBackendPages <= 1) {
        return items;
      }

      const pagesToLoad = Array.from(
        { length: totalBackendPages - 1 },
        (_, index) => index + 2,
      );

      const responses = await Promise.all(
        pagesToLoad.map((page) =>
          fetchMore({
            variables: isUserSpecific
              ? {
                  userId: userId ?? '',
                  params: { page, limit: BACKEND_PAGE_SIZE },
                }
              : {
                  params: { page, limit: BACKEND_PAGE_SIZE },
                },
          }),
        ),
      );

      const remainingCvs = responses.flatMap((response) => {
        const responseData = response.data as
          (CvsData | CvsByUserIdData) | undefined;
        if (!responseData) return [];

        if ('cvsByUserId' in responseData && responseData.cvsByUserId?.items) {
          return responseData.cvsByUserId.items;
        }
        if ('cvs' in responseData && responseData.cvs?.items) {
          return responseData.cvs.items;
        }
        return [];
      });

      return [...items, ...remainingCvs];
    },
    [fetchMore, isUserSpecific, userId],
  );

  useEffect(() => {
    if (!data) return;

    const syncCvs = async () => {
      try {
        const cvs = await loadAllCvs(data);
        setAllCvs(cvs);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    };

    void syncCvs();
  }, [data, loadAllCvs]);

  const handleRefresh = async (): Promise<void> => {
    try {
      const result = await refetch();
      if (!result.data) return;

      const cvs = await loadAllCvs(result.data);
      setAllCvs(cvs);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

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

  const getTotalItems = (): number => {
    if (!data) return 0;
    if ('cvsByUserId' in data && data.cvsByUserId) {
      return data.cvsByUserId.total;
    }
    if ('cvs' in data && data.cvs) {
      return data.cvs.total;
    }
    return 0;
  };

  const totalItems = getTotalItems();
  const hasError = Boolean(error) || loadError;
  const isLoading = loading || Boolean(data && allCvs.length < totalItems);

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
          userId={targetUserId}
          onSuccess={handleRefresh}
          trigger={
            <Button
              type="button"
              className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
              variant="primaryV2"
            >
              <PlusIcon className="size-6" />
              <span className="hidden lg:inline">
                {t('cvs.createCv', 'CREATE CV')}
              </span>
            </Button>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        {hasError ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">
              {t('cvs.loadError', 'Failed to load CVs')}
            </p>
            <Button type="button" onClick={() => void handleRefresh()}>
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
                isAdmin={isAdmin}
                onRefresh={handleRefresh}
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
