'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CVS_BY_USER_ID_QUERY,
  CVS_QUERY,
  type ApiCv,
  type CvsData,
  type CvsByUserIdData,
} from '@/api/cvs';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { CvsTable } from '@/features/cvs/components/CvsTable';
import { CreateCvModal } from '@/features/cvs/components/modals/CreateCvModal';
import type { Cv, SortField } from '@/features/cvs/types';
import { ContentLayout } from '@/components/common/ContentLayout';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';

interface CvsContentProps {
  isAdmin?: boolean;
  userId?: string;
  currentUserId?: string;
}

type CombinedCvResponse = CvsData | CvsByUserIdData;

export function CvsContent({
  isAdmin = false,
  userId,
  currentUserId,
}: CvsContentProps) {
  const { t } = useTranslation();

  const targetUserId = userId || currentUserId;
  const isUserSpecific = Boolean(userId);

  const query = isUserSpecific ? CVS_BY_USER_ID_QUERY : CVS_QUERY;
  const variables = isUserSpecific ? { userId: userId ?? '' } : undefined;

  const extractPaginatedData = useCallback((data: CombinedCvResponse) => {
    if ('cvsByUserId' in data && data.cvsByUserId) {
      return data.cvsByUserId;
    }
    if ('cvs' in data && data.cvs) {
      return data.cvs;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((cv: ApiCv, queryStr: string) => {
    const name = cv.name.toLowerCase();
    const education = (cv.education ?? '').toLowerCase();
    const employee = (cv.user?.email ?? '').toLowerCase();

    return (
      name.includes(queryStr) ||
      education.includes(queryStr) ||
      employee.includes(queryStr)
    );
  }, []);

  const getSortValue = useCallback((cv: ApiCv, field: SortField) => {
    switch (field) {
      case 'name':
        return cv.name;
      default:
        return '';
    }
  }, []);

  const {
    paginatedItems: rawCvs,
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
    CombinedCvResponse,
    Record<string, unknown>,
    ApiCv,
    SortField
  >({
    query,
    variables,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });

  const cvs: Cv[] = rawCvs.map((cv) => ({
    id: cv.id,
    name: cv.name,
    education: cv.education ?? '',
    employee: cv.user?.email ?? '',
    description: cv.description,
  }));

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('cvs.loadError', 'Failed to load CVs')}
      onRetry={handleRefresh}
      search={search}
      onSearchChange={setSearch}
      actionTrigger={
        <CreateCvModal
          userId={targetUserId}
          onSuccess={() => void handleRefresh()}
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
      }
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
    >
      <CvsTable
        cvs={cvs}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        isAdmin={isAdmin}
        onRefresh={async () => {
          await handleRefresh();
        }}
      />
    </ContentLayout>
  );
}
