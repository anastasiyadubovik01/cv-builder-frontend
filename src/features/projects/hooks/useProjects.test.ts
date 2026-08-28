import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PROJECTS_QUERY, type ApiProject } from '@/api/projects';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';

import { useProjects } from './useProjects';

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: vi.fn(),
}));

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('configures usePaginatedQuery for projects', () => {
    renderHook(() => useProjects());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(options.query).toBe(PROJECTS_QUERY);
    expect(options.defaultSortBy).toBe('name');
  });

  it('extracts projects from query data', () => {
    renderHook(() => useProjects());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const projects = {
      items: [],
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 0,
    };

    const result = options.extractPaginatedData({
      projects,
    });

    expect(result).toBe(projects);
  });

  it('filters projects by name or domain', () => {
    renderHook(() => useProjects());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const project = {
      name: 'CV Builder',
      domain: 'Healthcare',
    } as ApiProject;

    expect(options.filterItem?.(project, 'builder')).toBe(true);
    expect(options.filterItem?.(project, 'health')).toBe(true);
    expect(options.filterItem?.(project, 'banking')).toBe(false);
  });

  it('returns correct values for sorting', () => {
    renderHook(() => useProjects());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const project = {
      name: 'CV Builder',
      domain: 'Healthcare',
      start_date: '2024-01-01',
      end_date: '2025-01-01',
    } as ApiProject;

    expect(options.getSortValue?.(project, 'name')).toBe('CV Builder');
    expect(options.getSortValue?.(project, 'startDate')).toBe('2024-01-01');
    expect(options.getSortValue?.(project, 'endDate')).toBe('2025-01-01');
  });

  it('returns empty string for missing end date', () => {
    renderHook(() => useProjects());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const project = {
      name: 'CV Builder',
      domain: 'Healthcare',
      start_date: '2024-01-01',
      end_date: null,
    } as ApiProject;

    expect(options.getSortValue?.(project, 'endDate')).toBe('');
  });
});
