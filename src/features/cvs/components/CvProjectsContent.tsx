'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client/react';

import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SearchInput } from '@/components/ui/search-input';
import { CvProjectsTable } from '@/features/cvs/components/CvProjectsTable';
import { AddCvProjectModal } from '@/features/cvs/components/modals/AddCvProjectModal';

import type {
  CvProject,
  CvProjectSortField,
  SortDirection,
} from '@/features/cvs/types';
import { CV_PROJECTS_QUERY } from '@/api/cv-projects';

interface ApiCvProject {
  id: string;
  name: string;
  domain: string;
  responsibilities: string[];
  start_date: string;
  end_date: string | null;
  description: string;
  environment: string[];
  roles: string[];
  project?: {
    name: string;
    domain: string;
    start_date: string;
    end_date: string | null;
    description: string;
    environment: string[];
  };
}

interface CvProjectsContentProps {
  cvId: string;
}

export function CvProjectsContent({ cvId }: CvProjectsContentProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<CvProjectSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(CV_PROJECTS_QUERY, {
    variables: { cvId },
    fetchPolicy: 'cache-and-network',
  });

  const apiProjects: ApiCvProject[] = data?.cv?.projects ?? [];

  const projects: CvProject[] = apiProjects.map((p) => ({
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

  const handleSort = (field: CvProjectSortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
  };

  const handleRefresh = async (): Promise<void> => {
    await refetch();
  };

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      {loading && <LoadingOverlay />}

      <div className="mx-6 mt-[7px] flex items-center justify-between shrink-0">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('cvs.search', 'Search')}
          className="bg-background"
        />

        <AddCvProjectModal
          cvId={cvId}
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={handleRefresh}
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
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        {error ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">
              {t('projects.loadError', 'Failed to load projects')}
            </p>
            <Button type="button" onClick={() => void handleRefresh()}>
              {t('retry', 'Retry')}
            </Button>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CvProjectsTable
              projects={sortedProjects}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
              hasSearchQuery={normalizedSearch.length > 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
