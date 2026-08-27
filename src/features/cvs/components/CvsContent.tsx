'use client';

import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { CvsTable } from '@/features/cvs/components/CvsTable';
import { CreateCvModal } from '@/features/cvs/components/modals/CreateCvModal';
import { ContentLayout } from '@/components/common/ContentLayout';
import { useCvs } from '@/features/cvs/hooks/useCvs';
import type { Cv } from '@/features/cvs/types';

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

  const targetUserId = userId || currentUserId;

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
  } = useCvs(userId);

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
