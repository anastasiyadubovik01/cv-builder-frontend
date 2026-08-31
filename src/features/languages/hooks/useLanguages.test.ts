import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLanguages } from './useLanguages';
import {
  LANGUAGES_QUERY,
  type ApiLanguage,
  type LanguagesQueryData,
} from '@/api/languages';
import type { LanguageSortField } from '../types';

const mockUsePaginatedQuery = vi.fn();

vi.mock('@/components/hooks/usePaginatedQuery', () => ({
  usePaginatedQuery: (args: unknown) => mockUsePaginatedQuery(args),
}));

vi.mock('@/components/hooks/useFetchAllPages', () => ({
  getEmptyPaginatedResponse: () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  }),
}));

describe('useLanguages hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call usePaginatedQuery with correct initial configuration', () => {
    renderHook(() => useLanguages());

    expect(mockUsePaginatedQuery).toHaveBeenCalledTimes(1);
    const config = mockUsePaginatedQuery.mock.calls[0][0];

    expect(config.query).toBe(LANGUAGES_QUERY);
    expect(config.defaultSortBy).toBe('name');
    expect(typeof config.extractPaginatedData).toBe('function');
    expect(typeof config.filterItem).toBe('function');
    expect(typeof config.getSortValue).toBe('function');
  });

  describe('extractPaginatedData', () => {
    it('should extract languages successfully when valid paginated data structure is provided', () => {
      renderHook(() => useLanguages());
      const config = mockUsePaginatedQuery.mock.calls[0][0];

      const mockData: LanguagesQueryData = {
        languages: {
          items: [
            {
              id: '1',
              created_at: '2026-01-01',
              iso2: 'en',
              name: 'English',
              native_name: 'English',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          total_pages: 1,
        },
      };

      const result = config.extractPaginatedData(mockData);
      expect(result).toEqual(mockData.languages);
    });

    it('should return empty paginated response when languages property is missing or null', () => {
      renderHook(() => useLanguages());
      const config = mockUsePaginatedQuery.mock.calls[0][0];

      const invalidData = {} as LanguagesQueryData;
      const result = config.extractPaginatedData(invalidData);

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0,
      });
    });
  });

  describe('filterItem', () => {
    it('should return true when language name matches search query', () => {
      renderHook(() => useLanguages());
      const config = mockUsePaginatedQuery.mock.calls[0][0];

      const language: ApiLanguage = {
        id: '1',
        created_at: '2026-01-01',
        iso2: 'fr',
        name: 'French Language',
        native_name: 'Français',
      };

      expect(config.filterItem(language, 'french')).toBe(true);
      expect(config.filterItem(language, 'lang')).toBe(true);
      expect(config.filterItem(language, 'spanish')).toBe(false);
    });
  });

  describe('getSortValue', () => {
    const sampleLanguage: ApiLanguage = {
      id: '1',
      created_at: '2026-01-01',
      iso2: 'de',
      name: 'German',
      native_name: 'Deutsch',
    };

    it('should return correct sort value for name field', () => {
      renderHook(() => useLanguages());
      const config = mockUsePaginatedQuery.mock.calls[0][0];

      const sortValue = config.getSortValue(
        sampleLanguage,
        'name' as LanguageSortField,
      );
      expect(sortValue).toBe('German');
    });

    it('should return correct sort value for iso2 field when defined', () => {
      renderHook(() => useLanguages());
      const config = mockUsePaginatedQuery.mock.calls[0][0];

      const sortValue = config.getSortValue(
        sampleLanguage,
        'iso2' as LanguageSortField,
      );
      expect(sortValue).toBe('de');
    });

    it('should return empty string for iso2 field when iso2 is null or undefined', () => {
      renderHook(() => useLanguages());
      const config = mockUsePaginatedQuery.mock.calls[0][0];

      const languageWithoutIso2: ApiLanguage = {
        ...sampleLanguage,
        iso2: undefined as unknown as string,
      };

      const sortValue = config.getSortValue(
        languageWithoutIso2,
        'iso2' as LanguageSortField,
      );
      expect(sortValue).toBe('');
    });

    it('should return empty string for unknown or unsupported sort fields', () => {
      renderHook(() => useLanguages());
      const config = mockUsePaginatedQuery.mock.calls[0][0];

      const sortValue = config.getSortValue(
        sampleLanguage,
        'unknown_field' as LanguageSortField,
      );
      expect(sortValue).toBe('');
    });
  });
});
