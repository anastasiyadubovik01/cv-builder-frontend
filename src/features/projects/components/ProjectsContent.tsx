'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client/react';
import { ApiProject, PROJECTS_QUERY } from '@/api/projects';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

import { ProjectsTable } from './ProjectsTable';
import type { Project, ProjectSortField, SortDirection } from '../types';
import { CreateProjectModal } from '@/features/projects/components/modals/CreateProjectModal';
import { QueryErrorState } from '@/components/common/QueryErrorState';

export function ProjectsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ProjectSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [allProjects, setAllProjects] = useState<ApiProject[]>([]);
  const [loadError, setLoadError] = useState(false);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    PROJECTS_QUERY,
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

  const loadAllProjects = useCallback(
    async (sourceData: NonNullable<typeof data>): Promise<ApiProject[]> => {
      const firstPageItems = sourceData.projects.items;
      const totalBackendPages = sourceData.projects.total_pages;

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
        (response) => response.data.projects.items,
      );

      return [...firstPageItems, ...remainingItems];
    },
    [fetchMore],
  );

  useEffect(() => {
    if (!data) return;

    const syncProjects = async () => {
      try {
        const items = await loadAllProjects(data);
        setAllProjects(items);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    };

    void syncProjects();
  }, [data, loadAllProjects]);

  const handleRefresh = async (): Promise<void> => {
    try {
      const result = await refetch();
      if (!result.data) return;

      const items = await loadAllProjects(result.data);
      setAllProjects(items);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

  const projects: Project[] = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    domain: p.domain,
    startDate: p.start_date,
    endDate: p.end_date?.trim() ? p.end_date : t('projects.present', 'Present'),
    description: p.description,
    environmentSkills: p.environment,
  }));

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProjects = projects.filter((project) => {
    return (
      project.name.toLowerCase().includes(normalizedSearch) ||
      project.domain.toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const firstValue = (a[sortBy] ?? '').trim();
    const secondValue = (b[sortBy] ?? '').trim();

    if (!firstValue && !secondValue) return 0;
    if (!firstValue) return 1;
    if (!secondValue) return -1;

    return sortDirection === 'asc'
      ? firstValue.localeCompare(secondValue)
      : secondValue.localeCompare(firstValue);
  });

  const totalPages = Math.ceil(sortedProjects.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProjects = sortedProjects.slice(
    startIndex,
    startIndex + pageSize,
  );

  const handleSort = (field: ProjectSortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setCurrentPage(1);
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const hasError = Boolean(error) || loadError;
  const isLoading =
    loading || Boolean(data && allProjects.length < data.projects.total);

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
          placeholder={t('projects.search', 'Search')}
          className="bg-background"
        />
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
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        {hasError ? (
          <QueryErrorState
            message={t('projects.loadError', 'Failed to load projects')}
            onRetry={handleRefresh}
          />
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ProjectsTable
                projects={paginatedProjects}
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
