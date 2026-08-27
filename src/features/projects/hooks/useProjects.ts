import { useCallback } from 'react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import { getEmptyPaginatedResponse } from '@/components/hooks/useFetchAllPages';
import {
  PROJECTS_QUERY,
  type ApiProject,
  type ProjectsData,
} from '@/api/projects';
import type { ProjectSortField } from '../types';

export function useProjects() {
  const extractPaginatedData = useCallback((data: ProjectsData) => {
    if ('projects' in data && data.projects) {
      return data.projects;
    }
    return getEmptyPaginatedResponse<ApiProject>();
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

  return usePaginatedQuery<
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
}
