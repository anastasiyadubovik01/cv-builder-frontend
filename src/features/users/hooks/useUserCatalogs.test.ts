import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserCatalogs } from './useUserCatalogs';

const mockUseQuery = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (query: unknown, options: unknown) => mockUseQuery(query, options),
  gql: (str: TemplateStringsArray) => str,
}));

describe('useUserCatalogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return departments and positions arrays from queries', () => {
    mockUseQuery.mockImplementation((query) => {
      if (
        query.definitions[0].selectionSet.selections[0].name.value ===
        'departments'
      ) {
        return {
          data: {
            departments: {
              items: [{ id: '1', name: 'DevOps' }],
            },
          },
        };
      }
      return {
        data: {
          positions: {
            items: [{ id: '1', name: 'Developer' }],
          },
        },
      };
    });

    const { result } = renderHook(() => useUserCatalogs());

    expect(result.current.departments).toEqual([{ id: '1', name: 'DevOps' }]);
    expect(result.current.positions).toEqual([{ id: '1', name: 'Developer' }]);
  });

  it('should return empty arrays as fallback when data is missing or undefined', () => {
    mockUseQuery.mockReturnValue({ data: undefined });

    const { result } = renderHook(() => useUserCatalogs());

    expect(result.current.departments).toEqual([]);
    expect(result.current.positions).toEqual([]);
  });
});
