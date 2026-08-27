'use client';

import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { CvProjectsTable } from '@/features/cvs/components/projects/CvProjectsTable';
import { AddCvProjectModal } from '@/features/cvs/components/projects/modals/AddCvProjectModal';
import type { CvProject } from '@/features/cvs/types';
import { useCvProjects } from '@/features/cvs/components/projects/hooks/useCvProjects';

interface CvProjectsContentProps {
  cvId: string;
}

export function CvProjectsContent({ cvId }: CvProjectsContentProps) {
  const { t } = useTranslation();

  const {
    paginatedItems: rawProjects,
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
  } = useCvProjects(cvId);

  const projects: CvProject[] = rawProjects.map((p) => ({
    id: p.id,
    name: p.name || p.project?.name || '',
    domain: p.domain || p.project?.domain || '',
    responsibilities: p.responsibilities ?? [],
    startDate: p.start_date || p.project?.start_date || '',
    endDate: p.end_date || p.project?.end_date || null,
    description: p.description || p.project?.description || '',
    environment: p.environment || p.project?.environment || [],
    roles: p.roles ?? [],
  }));

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('projects.loadError', 'Failed to load projects')}
      onRetry={handleRefresh}
      search={search}
      onSearchChange={setSearch}
      actionTrigger={
        <AddCvProjectModal
          cvId={cvId}
          onSuccess={() => void handleRefresh()}
          trigger={
            <Button
              type="button"
              className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
              variant="primaryV2"
            >
              <PlusIcon className="size-6" />
              <span className="hidden lg:inline">
                {t('projects.addProject', 'ADD PROJECT')}
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
      <CvProjectsTable
        cvId={cvId}
        projects={projects}
        rawProjects={rawProjects}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        hasSearchQuery={search.trim().length > 0}
        onRefetch={async () => {
          await handleRefresh();
        }}
      />
    </ContentLayout>
  );
}
