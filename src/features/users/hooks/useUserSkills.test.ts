import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserSkills } from './useUserSkills';

const mockUseQuery = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (query: unknown, options: unknown) => mockUseQuery(query, options),
  gql: (str: TemplateStringsArray) => str,
}));

describe('useUserSkills', () => {
  const mockRefetchUser = vi.fn().mockResolvedValue(undefined);
  const mockRefetchSkills = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return profile skills, available skills, and loading state successfully', () => {
    mockUseQuery.mockImplementation((query) => {
      if (
        query.definitions[0].selectionSet.selections[0].name.value === 'user'
      ) {
        return {
          data: {
            user: {
              profile: {
                skills: [{ id: '1', name: 'JavaScript' }],
              },
            },
          },
          loading: false,
          error: undefined,
          refetch: mockRefetchUser,
        };
      }
      return {
        data: {
          skills: {
            items: [
              { id: '1', name: 'JavaScript' },
              { id: '2', name: 'TypeScript' },
            ],
          },
        },
        loading: false,
        error: undefined,
        refetch: mockRefetchSkills,
      };
    });

    const { result } = renderHook(() => useUserSkills('123'));

    expect(result.current.profileSkills).toEqual([
      { id: '1', name: 'JavaScript' },
    ]);
    expect(result.current.availableSkills).toEqual([
      { id: '1', name: 'JavaScript' },
      { id: '2', name: 'TypeScript' },
    ]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it('should handle loading state and error states properly', () => {
    const userError = new Error('Failed to fetch user skills');
    mockUseQuery.mockImplementation((query) => {
      if (
        query.definitions[0].selectionSet.selections[0].name.value === 'user'
      ) {
        return {
          data: undefined,
          loading: true,
          error: userError,
          refetch: mockRefetchUser,
        };
      }
      return {
        data: undefined,
        loading: false,
        error: undefined,
        refetch: mockRefetchSkills,
      };
    });

    const { result } = renderHook(() => useUserSkills('123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(true);
  });

  it('should correctly execute handleRefetch and invoke refetch on both queries', async () => {
    mockUseQuery.mockImplementation((query) => {
      if (
        query.definitions[0].selectionSet.selections[0].name.value === 'user'
      ) {
        return {
          data: { user: { profile: { skills: [] } } },
          loading: false,
          error: undefined,
          refetch: mockRefetchUser,
        };
      }
      return {
        data: { skills: { items: [] } },
        loading: false,
        error: undefined,
        refetch: mockRefetchSkills,
      };
    });

    const { result } = renderHook(() => useUserSkills('123'));

    await act(async () => {
      await result.current.handleRefetch();
    });

    expect(mockRefetchUser).toHaveBeenCalledTimes(1);
    expect(mockRefetchSkills).toHaveBeenCalledTimes(1);
  });
});
