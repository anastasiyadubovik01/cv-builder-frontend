'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';

import { ProjectsTable } from './ProjectsTable';
import { MOCK_PROJECTS } from '../mocks/projectsData';
import type { ProjectSortField, SortDirection } from '../types';

export function ProjectsContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<ProjectSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [projects] = useState(MOCK_PROJECTS);

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

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
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
        <Button
          type="button"
          className="flex items-center gap-2 uppercase font-medium text-[14px]"
          variant="primaryV2"
          onClick={() => {
            // create
          }}
        >
          <PlusIcon className="size-6" />
          {t('projects.createProject', 'Create project')}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
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
      </div>
    </div>
  );
}
