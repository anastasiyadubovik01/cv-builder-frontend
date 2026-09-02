import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CV_PROJECTS_QUERY,
  type ApiCvProject,
  type CvProjectsData,
} from '@/api/cv-projects';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';

import { useCvProjects } from './useCvProjects';

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: vi.fn(),
}));

describe('useCvProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePaginatedQuery).mockReturnValue({
      items: [],
    } as never);
  });

  it('configures paginated query', () => {
    renderHook(() => useCvProjects('cv-1'));

    expect(usePaginatedQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        query: CV_PROJECTS_QUERY,
        variables: {
          cvId: 'cv-1',
        },
        defaultSortBy: 'name',
        extractPaginatedData: expect.any(Function),
        filterItem: expect.any(Function),
        getSortValue: expect.any(Function),
      }),
    );
  });

  it('extracts projects from CV data', () => {
    renderHook(() => useCvProjects('cv-1'));

    const config = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const projects = [
      {
        id: 'cv-project-1',
      },
      {
        id: 'cv-project-2',
      },
    ] as ApiCvProject[];

    const data = {
      cv: {
        projects,
      },
    } as CvProjectsData;

    const result = config.extractPaginatedData(data);

    expect(result).toEqual({
      items: projects,
      total: 2,
      total_pages: 1,
    });
  });

  it('returns empty list when projects are missing', () => {
    renderHook(() => useCvProjects('cv-1'));

    const config = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const result = config.extractPaginatedData({} as CvProjectsData);

    expect(result).toEqual({
      items: [],
      total: 0,
      total_pages: 1,
    });
  });

  it('filters project by name', () => {
    renderHook(() => useCvProjects('cv-1'));

    const config = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(config.filterItem).toBeDefined();

    const filterItem = config.filterItem!;

    const project = {
      id: 'cv-project-1',
      name: 'CV Builder',
      domain: 'HR',
    } as ApiCvProject;

    expect(filterItem(project, 'builder')).toBe(true);
    expect(filterItem(project, 'finance')).toBe(false);
  });

  it('filters project by nested domain', () => {
    renderHook(() => useCvProjects('cv-1'));

    const config = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(config.filterItem).toBeDefined();

    const filterItem = config.filterItem!;

    const project = {
      id: 'cv-project-1',
      project: {
        name: 'Internal Tool',
        domain: 'Healthcare',
      },
    } as ApiCvProject;

    expect(filterItem(project, 'health')).toBe(true);
  });

  it('returns sort value for name', () => {
    renderHook(() => useCvProjects('cv-1'));

    const config = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(config.getSortValue).toBeDefined();

    const getSortValue = config.getSortValue!;

    const project = {
      id: 'cv-project-1',
      name: 'CV Builder',
    } as ApiCvProject;

    expect(getSortValue(project, 'name')).toBe('CV Builder');
  });

  it('returns sort values for dates', () => {
    renderHook(() => useCvProjects('cv-1'));

    const config = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(config.getSortValue).toBeDefined();

    const getSortValue = config.getSortValue!;

    const project = {
      id: 'cv-project-1',
      project: {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      },
    } as ApiCvProject;

    expect(getSortValue(project, 'startDate')).toBe('2024-01-01');

    expect(getSortValue(project, 'endDate')).toBe('2024-12-31');
  });

  it('returns empty value for unknown sort field', () => {
    renderHook(() => useCvProjects('cv-1'));

    const config = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(config.getSortValue).toBeDefined();

    const getSortValue = config.getSortValue!;

    const project = {
      id: 'cv-project-1',
    } as ApiCvProject;

    expect(getSortValue(project, 'unknown')).toBe('');
  });

  it('returns result from usePaginatedQuery', () => {
    const paginatedResult = {
      items: [{ id: 'cv-project-1' }],
      loading: false,
    };

    vi.mocked(usePaginatedQuery).mockReturnValue(paginatedResult as never);

    const { result } = renderHook(() => useCvProjects('cv-1'));

    expect(result.current).toBe(paginatedResult);
  });
});
