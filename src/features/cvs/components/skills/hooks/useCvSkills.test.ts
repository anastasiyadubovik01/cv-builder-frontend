import { act, renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CV_SKILLS_QUERY } from '@/api/cv-skills';
import { SKILLS_QUERY } from '@/api/skills';

import { useCvSkills } from './useCvSkills';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}));

describe('useCvSkills', () => {
  const refetchCvSkills = vi.fn();
  const refetchAllSkills = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    refetchCvSkills.mockResolvedValue({});
    refetchAllSkills.mockResolvedValue({});

    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === CV_SKILLS_QUERY) {
        return {
          data: {
            cv: {
              skills: [
                {
                  name: 'React',
                  mastery: 'Advanced',
                  categoryId: 'frontend',
                },
              ],
            },
          },
          loading: false,
          error: undefined,
          refetch: refetchCvSkills,
        } as never;
      }

      if (query === SKILLS_QUERY) {
        return {
          data: {
            skills: {
              items: [
                {
                  id: 'skill-1',
                  name: 'React',
                },
                {
                  id: 'skill-2',
                  name: 'TypeScript',
                },
              ],
            },
          },
          loading: false,
          error: undefined,
          refetch: refetchAllSkills,
        } as never;
      }

      throw new Error('Unexpected query');
    });
  });

  it('loads CV skills and all skills', () => {
    renderHook(() => useCvSkills('cv-1'));

    expect(useQuery).toHaveBeenCalledWith(CV_SKILLS_QUERY, {
      variables: {
        cvId: 'cv-1',
      },
      fetchPolicy: 'cache-and-network',
    });

    expect(useQuery).toHaveBeenCalledWith(SKILLS_QUERY, {
      variables: {
        params: {
          page: 1,
          limit: 100,
        },
      },
    });
  });

  it('returns CV skills and available skills', () => {
    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.cvSkills).toEqual([
      {
        name: 'React',
        mastery: 'Advanced',
        categoryId: 'frontend',
      },
    ]);

    expect(result.current.availableSkills).toEqual([
      {
        id: 'skill-1',
        name: 'React',
      },
      {
        id: 'skill-2',
        name: 'TypeScript',
      },
    ]);
  });

  it('returns empty arrays when query data is missing', () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === CV_SKILLS_QUERY) {
        return {
          data: undefined,
          loading: false,
          error: undefined,
          refetch: refetchCvSkills,
        } as never;
      }

      return {
        data: undefined,
        loading: false,
        error: undefined,
        refetch: refetchAllSkills,
      } as never;
    });

    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.cvSkills).toEqual([]);
    expect(result.current.availableSkills).toEqual([]);
  });

  it('returns loading when CV skills are loading', () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === CV_SKILLS_QUERY) {
        return {
          data: undefined,
          loading: true,
          error: undefined,
          refetch: refetchCvSkills,
        } as never;
      }

      return {
        data: undefined,
        loading: false,
        error: undefined,
        refetch: refetchAllSkills,
      } as never;
    });

    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.loading).toBe(true);
  });

  it('returns loading when all skills are loading', () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === CV_SKILLS_QUERY) {
        return {
          data: undefined,
          loading: false,
          error: undefined,
          refetch: refetchCvSkills,
        } as never;
      }

      return {
        data: undefined,
        loading: true,
        error: undefined,
        refetch: refetchAllSkills,
      } as never;
    });

    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.loading).toBe(true);
  });

  it('returns error when CV skills query fails', () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === CV_SKILLS_QUERY) {
        return {
          data: undefined,
          loading: false,
          error: new Error('CV skills error'),
          refetch: refetchCvSkills,
        } as never;
      }

      return {
        data: undefined,
        loading: false,
        error: undefined,
        refetch: refetchAllSkills,
      } as never;
    });

    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.error).toBe(true);
  });

  it('returns error when all skills query fails', () => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === CV_SKILLS_QUERY) {
        return {
          data: undefined,
          loading: false,
          error: undefined,
          refetch: refetchCvSkills,
        } as never;
      }

      return {
        data: undefined,
        loading: false,
        error: new Error('Skills error'),
        refetch: refetchAllSkills,
      } as never;
    });

    const { result } = renderHook(() => useCvSkills('cv-1'));

    expect(result.current.error).toBe(true);
  });

  it('refreshes both queries', async () => {
    const { result } = renderHook(() => useCvSkills('cv-1'));

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(refetchCvSkills).toHaveBeenCalledTimes(1);
    expect(refetchAllSkills).toHaveBeenCalledTimes(1);
  });
});
