import { useCallback } from 'react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import {
  CV_PROJECTS_QUERY,
  type ApiCvProject,
  type CvProjectsData,
} from '@/api/cv-projects';
import type { CvProjectSortField } from '@/features/cvs/types';

export function useCvProjects(cvId: string) {
  const extractPaginatedData = useCallback((data: CvProjectsData) => {
    const projects = data?.cv?.projects ?? [];
    return {
      items: projects,
      total: projects.length,
      total_pages: 1,
    };
  }, []);

  const filterItem = useCallback((p: ApiCvProject, queryStr: string) => {
    const name = (p.name || p.project?.name || '').toLowerCase();
    const domain = (p.domain || p.project?.domain || '').toLowerCase();

    return name.includes(queryStr) || domain.includes(queryStr);
  }, []);

  const getSortValue = useCallback(
    (p: ApiCvProject, field: CvProjectSortField) => {
      switch (field) {
        case 'name':
          return p.name || p.project?.name || '';
        case 'startDate':
          return p.start_date || p.project?.start_date || '';
        case 'endDate':
          return p.end_date || p.project?.end_date || '';
        default:
          return '';
      }
    },
    [],
  );

  return usePaginatedQuery<
    CvProjectsData,
    { cvId: string },
    ApiCvProject,
    CvProjectSortField
  >({
    query: CV_PROJECTS_QUERY,
    variables: { cvId },
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });
}
