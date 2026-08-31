import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CVS_BY_USER_ID_QUERY, CVS_QUERY, type ApiCv } from '@/api/cvs';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';

import { useCvs } from './useCvs';

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: vi.fn(),
}));

describe('useCvs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses general CV query when userId is not provided', () => {
    renderHook(() => useCvs());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(options.query).toBe(CVS_QUERY);
    expect(options.variables).toBeUndefined();
    expect(options.defaultSortBy).toBe('name');
  });

  it('uses user-specific query and variables when userId is provided', () => {
    renderHook(() => useCvs('user-123'));

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    expect(options.query).toBe(CVS_BY_USER_ID_QUERY);

    expect(options.variables).toEqual({
      userId: 'user-123',
    });
  });

  it('extracts cvs from general query response', () => {
    renderHook(() => useCvs());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const cvs = {
      items: [],
      total: 0,
      total_pages: 0,
    };

    const result = options.extractPaginatedData({
      cvs,
    });

    expect(result).toBe(cvs);
  });

  it('extracts cvs from user-specific query response', () => {
    renderHook(() => useCvs('user-123'));

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const cvsByUserId = {
      items: [],
      total: 0,
      total_pages: 0,
    };

    const result = options.extractPaginatedData({
      cvsByUserId,
    });

    expect(result).toBe(cvsByUserId);
  });

  it('returns empty paginated data when response contains no cvs', () => {
    renderHook(() => useCvs());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const result = options.extractPaginatedData({} as never);

    expect(result).toEqual({
      items: [],
      total: 0,
      total_pages: 0,
    });
  });

  it('filters CVs by name, education or employee email', () => {
    renderHook(() => useCvs());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const cv = {
      name: 'Frontend Developer',
      education: 'Belarusian State University',
      user: {
        email: 'nastya@example.com',
      },
    } as ApiCv;

    expect(options.filterItem?.(cv, 'frontend')).toBe(true);
    expect(options.filterItem?.(cv, 'university')).toBe(true);
    expect(options.filterItem?.(cv, 'nastya')).toBe(true);
    expect(options.filterItem?.(cv, 'backend')).toBe(false);
  });

  it('handles missing education and user email during filtering', () => {
    renderHook(() => useCvs());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const cv = {
      name: 'Developer CV',
      education: null,
      user: null,
    } as ApiCv;

    expect(options.filterItem?.(cv, 'developer')).toBe(true);
    expect(options.filterItem?.(cv, 'university')).toBe(false);
  });

  it('returns CV name as sort value', () => {
    renderHook(() => useCvs());

    const options = vi.mocked(usePaginatedQuery).mock.calls[0][0];

    const cv = {
      name: 'Frontend Developer',
    } as ApiCv;

    expect(options.getSortValue?.(cv, 'name')).toBe('Frontend Developer');
  });
});
