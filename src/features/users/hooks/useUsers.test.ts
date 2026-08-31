import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUsers } from './useUsers';
import type { ApiUser, UsersData } from '@/api/users';
import type { SortField } from '@/features/users/types';

const mockPaginatedQuery = vi.fn();

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: (options: unknown) => mockPaginatedQuery(options),
}));

vi.mock('@apollo/client/react', () => ({
  gql: (str: TemplateStringsArray) => str,
}));

describe('useUsers', () => {
  const mockUserItems: ApiUser[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      profile: {
        first_name: 'John',
        last_name: 'Doe',
        avatar: null,
      },
      department: {
        name: 'Engineering',
      },
      position: {
        name: 'Developer',
      },
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      profile: {
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: null,
      },
      department: null,
      position: null,
    },
  ];

  const mockPaginatedData = {
    items: mockUserItems,
    total: 2,
    page: 1,
    limit: 10,
    total_pages: 1,
  };

  const mockPaginatedResult = {
    data: { users: mockPaginatedData },
    loading: false,
    error: null,
    refetch: vi.fn(),
    handleRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPaginatedQuery.mockReturnValue(mockPaginatedResult);
  });

  it('should initialize successfully and return pagination methods and state', () => {
    const { result } = renderHook(() => useUsers());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.handleRefresh).toBe('function');
  });

  it('should correctly execute extractPaginatedData, filtering, and sorting utilities', () => {
    renderHook(() => useUsers());
    const paginatedArg = mockPaginatedQuery.mock.calls[0]?.[0] as {
      extractPaginatedData: (data: UsersData) => typeof mockPaginatedData;
      filterItem: (user: ApiUser, queryStr: string) => boolean;
      getSortValue: (user: ApiUser, field: SortField) => string;
    };
    const { extractPaginatedData, filterItem, getSortValue } = paginatedArg;

    const extracted = extractPaginatedData({ users: mockPaginatedData });
    expect(extracted).toEqual(mockPaginatedData);

    const fallbackExtracted = extractPaginatedData({
      users: null,
    } as unknown as UsersData);
    expect(fallbackExtracted).toEqual({
      items: [],
      total: 0,
      total_pages: 0,
    });

    expect(filterItem(mockUserItems[0], 'john')).toBe(true);
    expect(filterItem(mockUserItems[0], 'doe')).toBe(true);
    expect(filterItem(mockUserItems[0], 'john.doe@example.com')).toBe(true);
    expect(filterItem(mockUserItems[0], 'unknown')).toBe(false);

    expect(getSortValue(mockUserItems[0], 'firstName')).toBe('John');
    expect(getSortValue(mockUserItems[0], 'lastName')).toBe('Doe');
    expect(getSortValue(mockUserItems[0], 'department')).toBe('Engineering');
    expect(getSortValue(mockUserItems[0], 'position')).toBe('Developer');
    expect(getSortValue(mockUserItems[1], 'department')).toBe('');
    expect(getSortValue(mockUserItems[1], 'position')).toBe('');
    expect(getSortValue(mockUserItems[0], 'unknown' as SortField)).toBe('');
  });
});
