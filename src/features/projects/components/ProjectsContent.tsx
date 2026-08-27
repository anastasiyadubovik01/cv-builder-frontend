'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PROJECTS_QUERY,
  type ApiProject,
  type ProjectsData,
} from '@/api/projects';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import { ProjectsTable } from './ProjectsTable';
import type { Project, ProjectSortField } from '../types';
import { CreateProjectModal } from '@/features/projects/components/modals/CreateProjectModal';

export function ProjectsContent() {
  const { t } = useTranslation();

  const extractPaginatedData = useCallback((data: ProjectsData) => {
    if ('projects' in data && data.projects) {
      return data.projects;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((project: ApiProject, queryStr: string) => {
    const name = project.name.toLowerCase();
    const domain = project.domain.toLowerCase();

    return name.includes(queryStr) || domain.includes(queryStr);
  }, []);

  const getSortValue = useCallback(
    (project: ApiProject, field: ProjectSortField) => {
      switch (field) {
        case 'name':
          return project.name;
        case 'startDate':
          return project.start_date;
        case 'endDate':
          return project.end_date ?? '';
        default:
          return '';
      }
    },
    [],
  );

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
  } = usePaginatedQuery<
    ProjectsData,
    Record<string, unknown>,
    ApiProject,
    ProjectSortField
  >({
    query: PROJECTS_QUERY,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });

  const projects: Project[] = rawProjects.map((p) => ({
    id: p.id,
    name: p.name,
    domain: p.domain,
    startDate: p.start_date,
    endDate: p.end_date?.trim() ? p.end_date : t('projects.present', 'Present'),
    description: p.description,
    environmentSkills: p.environment,
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
        <CreateProjectModal
          onSuccess={() => void handleRefresh()}
          trigger={
            <Button
              type="button"
              className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
              variant="primaryV2"
            >
              <PlusIcon className="size-6" />
              <span className="hidden lg:inline">
                {t('projects.createProject', 'Create project')}
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
      <ProjectsTable
        projects={projects}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </ContentLayout>
  );
}
