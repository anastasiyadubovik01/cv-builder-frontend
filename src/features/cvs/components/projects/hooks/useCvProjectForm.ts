import { useQuery } from '@apollo/client/react';
import { PROJECTS_QUERY, type ApiProject } from '@/api/projects';
import { POSITIONS_QUERY, type PositionsQueryResponse } from '@/api/positions';
import type { CreateCvProjectInputValues } from '@/lib/validations/cv-project';
import { formatArrayToCommaSeparated } from '@/lib/helpers/formatters';

const LIMIT = 1000;

export function useCvProjectForm() {
  const { data: projectsData, loading: projectsLoading } = useQuery(
    PROJECTS_QUERY,
    {
      variables: { params: { limit: LIMIT } },
    },
  );

  const { data: positionsData, loading: positionsLoading } =
    useQuery<PositionsQueryResponse>(POSITIONS_QUERY, {
      variables: { params: { limit: LIMIT } },
    });

  const catalogProjects: ApiProject[] = projectsData?.projects?.items || [];
  const positions = positionsData?.positions?.items || [];

  const getAutoFilledProjectData = (
    selectedProjectId: string,
  ): Partial<CreateCvProjectInputValues> | null => {
    const project = catalogProjects.find((p) => p.id === selectedProjectId);
    if (!project) return null;

    return {
      projectId: project.id,
      domain: project.domain || '',
      description: project.description || '',
      environment: formatArrayToCommaSeparated(project.environment),
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      projectStartDate: project.start_date || '',
      projectEndDate: project.end_date || '',
    };
  };

  return {
    catalogProjects,
    positions,
    loadingCatalog: projectsLoading || positionsLoading,
    getAutoFilledProjectData,
  };
}
