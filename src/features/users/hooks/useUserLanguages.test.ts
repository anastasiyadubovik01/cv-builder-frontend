import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserLanguages } from './useUserLanguages';

const mockUseQuery = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (query: unknown, options: unknown) => mockUseQuery(query, options),
  gql: (str: TemplateStringsArray) => str,
}));

describe('useUserLanguages', () => {
  const mockRefetchUserLanguages = vi.fn().mockResolvedValue(undefined);
  const mockRefetchLanguages = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return profile languages, available languages, and correct states', () => {
    mockUseQuery.mockImplementation((query) => {
      if (
        query.definitions[0].selectionSet.selections[0].name.value === 'user'
      ) {
        return {
          data: {
            user: {
              profile: {
                languages: [{ id: '1', name: 'English' }],
              },
            },
          },
          loading: false,
          error: undefined,
          refetch: mockRefetchUserLanguages,
        };
      }
      return {
        data: {
          languages: {
            items: [
              { id: '1', name: 'English' },
              { id: '2', name: 'Spanish' },
            ],
          },
        },
        loading: false,
        error: undefined,
        refetch: mockRefetchLanguages,
      };
    });

    const { result } = renderHook(() => useUserLanguages('123'));

    expect(result.current.profileLanguages).toEqual([
      { id: '1', name: 'English' },
    ]);
    expect(result.current.availableLanguages).toEqual([
      { id: '1', name: 'English' },
      { id: '2', name: 'Spanish' },
    ]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(typeof result.current.refetchUserLanguages).toBe('function');
    expect(typeof result.current.handleRefresh).toBe('function');
  });

  it('should handle loading and error states correctly', () => {
    const langError = new Error('Failed to load languages');
    mockUseQuery.mockImplementation((query) => {
      if (
        query.definitions[0].selectionSet.selections[0].name.value === 'user'
      ) {
        return {
          data: undefined,
          loading: false,
          error: undefined,
          refetch: mockRefetchUserLanguages,
        };
      }
      return {
        data: undefined,
        loading: true,
        error: langError,
        refetch: mockRefetchLanguages,
      };
    });

    const { result } = renderHook(() => useUserLanguages('123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(true);
  });

  it('should correctly execute handleRefresh and refetch both queries', async () => {
    mockUseQuery.mockImplementation((query) => {
      if (
        query.definitions[0].selectionSet.selections[0].name.value === 'user'
      ) {
        return {
          data: { user: { profile: { languages: [] } } },
          loading: false,
          error: undefined,
          refetch: mockRefetchUserLanguages,
        };
      }
      return {
        data: { languages: { items: [] } },
        loading: false,
        error: undefined,
        refetch: mockRefetchLanguages,
      };
    });

    const { result } = renderHook(() => useUserLanguages('123'));

    await act(async () => {
      await result.current.handleRefresh();
    });

    expect(mockRefetchUserLanguages).toHaveBeenCalledTimes(1);
    expect(mockRefetchLanguages).toHaveBeenCalledTimes(1);
  });
});
