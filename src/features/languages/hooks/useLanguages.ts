import { useCallback } from 'react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import {
  LANGUAGES_QUERY,
  type ApiLanguage,
  type LanguagesQueryData,
} from '@/api/languages';
import type { LanguageSortField } from '../types';

export function useLanguages() {
  const extractPaginatedData = useCallback((data: LanguagesQueryData) => {
    if ('languages' in data && data.languages) {
      return data.languages;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((language: ApiLanguage, queryStr: string) => {
    return language.name.toLowerCase().includes(queryStr);
  }, []);

  const getSortValue = useCallback(
    (language: ApiLanguage, field: LanguageSortField) => {
      switch (field) {
        case 'name':
          return language.name;
        case 'iso2':
          return language.iso2 ?? '';
        default:
          return '';
      }
    },
    [],
  );

  return usePaginatedQuery<
    LanguagesQueryData,
    Record<string, unknown>,
    ApiLanguage,
    LanguageSortField
  >({
    query: LANGUAGES_QUERY,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });
}
