import { renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PROJECTS_QUERY, type ApiProject } from '@/api/projects';
import { POSITIONS_QUERY } from '@/api/positions';
import { formatArrayToCommaSeparated } from '@/lib/helpers/formatters';

import { useCvProjectForm } from './useCvProjectForm';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}));

vi.mock('@/lib/helpers/formatters', () => ({
  formatArrayToCommaSeparated: vi.fn(),
}));

describe('useCvProjectForm', () => {
  const project = {
    id: 'project-1',
    name: 'CV Builder',
    domain: 'HR',
    description: 'CV management platform',
    environment: ['React', 'TypeScript'],
    start_date: '2025-01-01',
    end_date: '2025-12-31',
  } as ApiProject;

  const position = {
    id: 'position-1',
    name: 'Frontend Developer',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(formatArrayToCommaSeparated).mockReturnValue('React, TypeScript');

    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === PROJECTS_QUERY) {
        return {
          data: {
            projects: {
              items: [project],
            },
          },
          loading: false,
        } as never;
      }

      if (query === POSITIONS_QUERY) {
        return {
          data: {
            positions: {
              items: [position],
            },
          },
          loading: false,
        } as never;
      }

      throw new Error('Unexpected query');
    });
  });

  it('loads projects and positions with catalog limit', () => {
    renderHook(() => useCvProjectForm());

    expect(useQuery).toHaveBeenCalledWith(PROJECTS_QUERY, {
      variables: {
        params: {
          limit: 1000,
        },
      },
    });

    expect(useQuery).toHaveBeenCalledWith(POSITIONS_QUERY, {
      variables: {
        params: {
          limit: 1000,
        },
      },
    });
  });

  it('returns catalog projects and positions', () => {
    const { result } = renderHook(() => useCvProjectForm());

    expect(result.current.catalogProjects).toEqual([project]);

    expect(result.current.positions).toEqual([position]);

    expect(result.current.loadingCatalog).toBe(false);
  });

  it('returns empty arrays when query data is missing', () => {
    vi.mocked(useQuery).mockImplementation(() => {
      return {
        data: undefined,
        loading: false,
      } as never;
    });

    const { result } = renderHook(() => useCvProjectForm());

    expect(result.current.catalogProjects).toEqual([]);
    expect(result.current.positions).toEqual([]);
  });

  it('returns loadingCatalog when projects are loading', () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === PROJECTS_QUERY) {
        return {
          data: undefined,
          loading: true,
        } as never;
      }

      return {
        data: undefined,
        loading: false,
      } as never;
    });

    const { result } = renderHook(() => useCvProjectForm());

    expect(result.current.loadingCatalog).toBe(true);
  });

  it('returns loadingCatalog when positions are loading', () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === PROJECTS_QUERY) {
        return {
          data: undefined,
          loading: false,
        } as never;
      }

      return {
        data: undefined,
        loading: true,
      } as never;
    });

    const { result } = renderHook(() => useCvProjectForm());

    expect(result.current.loadingCatalog).toBe(true);
  });

  it('returns auto-filled project data for selected project', () => {
    const { result } = renderHook(() => useCvProjectForm());

    const autoFilled = result.current.getAutoFilledProjectData('project-1');

    expect(formatArrayToCommaSeparated).toHaveBeenCalledWith([
      'React',
      'TypeScript',
    ]);

    expect(autoFilled).toEqual({
      projectId: 'project-1',
      domain: 'HR',
      description: 'CV management platform',
      environment: 'React, TypeScript',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      projectStartDate: '2025-01-01',
      projectEndDate: '2025-12-31',
    });
  });

  it('returns null when selected project does not exist', () => {
    const { result } = renderHook(() => useCvProjectForm());

    const autoFilled =
      result.current.getAutoFilledProjectData('unknown-project');

    expect(autoFilled).toBeNull();

    expect(formatArrayToCommaSeparated).not.toHaveBeenCalled();
  });

  it('uses empty strings for missing optional project fields', () => {
    const projectWithoutOptionalFields: ApiProject = {
      ...project,
      domain: '',
      description: '',
      start_date: '',
      end_date: '',
    };

    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === PROJECTS_QUERY) {
        return {
          data: {
            projects: {
              items: [projectWithoutOptionalFields],
            },
          },
          loading: false,
        } as never;
      }

      return {
        data: {
          positions: {
            items: [position],
          },
        },
        loading: false,
      } as never;
    });

    const { result } = renderHook(() => useCvProjectForm());

    const autoFilled = result.current.getAutoFilledProjectData('project-1');

    expect(autoFilled).toEqual({
      projectId: 'project-1',
      domain: '',
      description: '',
      environment: 'React, TypeScript',
      startDate: '',
      endDate: '',
      projectStartDate: '',
      projectEndDate: '',
    });
  });
});
