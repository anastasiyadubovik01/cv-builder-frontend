import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdminSkills } from './useAdminSkills';
import type { ApiSkill, AdminSkillCategory } from '@/api/skills';

const mockPaginatedQuery = vi.fn();
const mockUseQuery = vi.fn();

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: () => mockPaginatedQuery(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (query: unknown) => mockUseQuery(query),
  gql: (str: TemplateStringsArray) => str,
}));

describe('useAdminSkills', () => {
  const mockSkillItems: ApiSkill[] = [
    {
      id: '1',
      name: 'JavaScript',
      category: {
        id: '1',
        name: 'Programming',
        order: 1,
        parent: null,
      },
      category_name: 'Programming',
      category_parent_name: null,
    },
    {
      id: '2',
      name: 'React',
      category: {
        id: '2',
        name: 'Frontend',
        order: 2,
        parent: {
          id: '1',
          name: 'Programming',
        },
      },
      category_name: 'Frontend',
      category_parent_name: 'Programming',
    },
  ];

  const mockCategories: AdminSkillCategory[] = [
    {
      id: '1',
      name: 'Programming',
      order: 1,
      parent: null,
      children: [
        { id: '2', name: 'Frontend', order: 2 },
        { id: '3', name: 'Backend', order: 3 },
      ],
    },
    {
      id: '4',
      name: 'Design',
      order: 2,
      parent: null,
      children: [],
    },
  ];

  const mockPaginatedData = {
    items: mockSkillItems,
    total: 2,
    page: 1,
    limit: 10,
    total_pages: 1,
  };

  const mockPaginatedResult = {
    data: { skills: mockPaginatedData },
    loading: false,
    error: null,
    refetch: vi.fn(),
    handleRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPaginatedQuery.mockReturnValue(mockPaginatedResult);
    mockUseQuery.mockReturnValue({
      data: { skillCategories: mockCategories },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should initialize with correct loading state and return all required properties', () => {
    const { result } = renderHook(() => useAdminSkills());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.categoryTypes).toBeDefined();
    expect(result.current.selectableCategories).toBeDefined();
    expect(typeof result.current.handleRetry).toBe('function');
    expect(typeof result.current.handleRefresh).toBe('function');
  });

  it('should compute categoryTypes correctly', () => {
    const { result } = renderHook(() => useAdminSkills());
    const expected = {
      '2': 'Programming',
      '3': 'Programming',
    };
    expect(result.current.categoryTypes).toEqual(expected);
  });

  it('should compute selectableCategories correctly', () => {
    const { result } = renderHook(() => useAdminSkills());
    const expectedSelectable = [
      { id: '2', name: 'Frontend' },
      { id: '3', name: 'Backend' },
      { id: '4', name: 'Design' },
    ].sort((a, b) => a.name.localeCompare(b.name));

    expect(result.current.selectableCategories).toEqual(expectedSelectable);
  });

  it('should handle loading state', () => {
    mockPaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      loading: true,
    });
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useAdminSkills());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasError).toBe(false);
  });

  it('should handle error state', () => {
    const paginatedError = new Error('Failed to fetch skills');
    mockPaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      error: paginatedError,
    });
    mockUseQuery.mockReturnValue({
      data: { skillCategories: mockCategories },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useAdminSkills());
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(paginatedError);
  });

  it('should handle error from categories query', () => {
    const categoriesError = new Error('Failed to fetch categories');
    mockPaginatedQuery.mockReturnValue(mockPaginatedResult);
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: categoriesError,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useAdminSkills());
    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should call refetch on handleRetry', async () => {
    const mockRefetchCategories = vi.fn().mockResolvedValue(undefined);
    const mockHandleRefresh = vi.fn().mockResolvedValue(undefined);

    mockPaginatedQuery.mockReturnValue({
      ...mockPaginatedResult,
      handleRefresh: mockHandleRefresh,
    });
    mockUseQuery.mockReturnValue({
      data: { skillCategories: mockCategories },
      loading: false,
      error: null,
      refetch: mockRefetchCategories,
    });

    const { result } = renderHook(() => useAdminSkills());

    await act(async () => {
      await result.current.handleRetry();
    });

    expect(mockHandleRefresh).toHaveBeenCalledTimes(1);
    expect(mockRefetchCategories).toHaveBeenCalledTimes(1);
  });

  it('should handle empty categories data gracefully', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useAdminSkills());
    expect(result.current.categoryTypes).toEqual({});
    expect(result.current.selectableCategories).toEqual([]);
  });
});
