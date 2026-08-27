'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { PlusIcon } from '@/components/icons/plus-icon';
import { CreateLanguageModal } from './CreateLanguageModal';
import { UpdateLanguageModal } from './UpdateLanguageModal';
import { DeleteLanguageModal } from './DeleteLanguageModal';

import { LANGUAGES_QUERY, type ApiLanguage } from '@/api/languages';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Pagination } from '@/components/ui/pagination';
import { SearchInput } from '@/components/ui/search-input';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

import { LanguagesTable } from './LanguagesTable';
import type { LanguageSortField, SortDirection } from '../types';
import { QueryErrorState } from '@/components/common/QueryErrorState';

export function AdminLanguagesContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<LanguageSortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [allLanguages, setAllLanguages] = useState<ApiLanguage[]>([]);
  const [loadError, setLoadError] = useState(false);

  const [editingLanguage, setEditingLanguage] = useState<ApiLanguage | null>(
    null,
  );

  const [deletingLanguage, setDeletingLanguage] = useState<ApiLanguage | null>(
    null,
  );

  const { data, loading, error, fetchMore, refetch } = useQuery(
    LANGUAGES_QUERY,
    {
      variables: {
        params: {
          page: 1,
          limit: BACKEND_PAGE_SIZE,
        },
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const loadAllLanguages = useCallback(
    async (sourceData: NonNullable<typeof data>): Promise<ApiLanguage[]> => {
      const firstPageItems = sourceData.languages.items;
      const totalBackendPages = sourceData.languages.total_pages;

      if (totalBackendPages <= 1) {
        return firstPageItems;
      }

      const pagesToLoad = Array.from(
        { length: totalBackendPages - 1 },
        (_, index) => index + 2,
      );

      const responses = await Promise.all(
        pagesToLoad.map((page) =>
          fetchMore({
            variables: {
              params: {
                page,
                limit: BACKEND_PAGE_SIZE,
              },
            },
          }),
        ),
      );

      const remainingItems = responses.flatMap(
        (response) => response.data.languages.items,
      );

      return [...firstPageItems, ...remainingItems];
    },
    [fetchMore],
  );

  useEffect(() => {
    if (!data) return;

    const syncLanguages = async () => {
      try {
        const items = await loadAllLanguages(data);

        setAllLanguages(items);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    };

    void syncLanguages();
  }, [data, loadAllLanguages]);

  const handleRefresh = async () => {
    try {
      const result = await refetch();

      if (!result.data) return;

      const items = await loadAllLanguages(result.data);

      setAllLanguages(items);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredLanguages = allLanguages.filter((language) =>
    language.name.toLowerCase().includes(normalizedSearch),
  );

  const sortedLanguages = [...filteredLanguages].sort((a, b) => {
    const firstValue = a[sortBy];
    const secondValue = b[sortBy];

    return sortDirection === 'asc'
      ? firstValue.localeCompare(secondValue)
      : secondValue.localeCompare(firstValue);
  });

  const totalPages = Math.ceil(sortedLanguages.length / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;

  const languages = sortedLanguages.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: LanguageSortField) => {
    if (sortBy === field) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      setCurrentPage(1);
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const hasError = Boolean(error) || loadError;

  const isLoading =
    loading || Boolean(data && allLanguages.length < data.languages.total);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      {!hasError && isLoading && <LoadingOverlay />}

      <div className="mx-6 mt-[7px] flex shrink-0 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('languages.admin.search')}
          className="bg-background"
        />

        <CreateLanguageModal
          languages={allLanguages}
          onSuccess={handleRefresh}
          trigger={
            <Button
              type="button"
              variant="primaryV2"
              className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
            >
              <PlusIcon className="size-6" />

              <span className="hidden lg:inline">
                {t('languages.admin.create')}
              </span>
            </Button>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4">
        {hasError ? (
          <QueryErrorState
            message={t('languages.admin.loadError', 'Failed to load languages')}
            onRetry={handleRefresh}
          />
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              <LanguagesTable
                languages={languages}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={setEditingLanguage}
                onDelete={setDeletingLanguage}
              />
            </div>

            <div className="shrink-0 bg-background pb-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>

            {editingLanguage && (
              <UpdateLanguageModal
                language={editingLanguage}
                languages={allLanguages}
                open={Boolean(editingLanguage)}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingLanguage(null);
                  }
                }}
                onSuccess={async () => {
                  await handleRefresh();
                  setEditingLanguage(null);
                }}
              />
            )}

            {deletingLanguage && (
              <DeleteLanguageModal
                languageId={deletingLanguage.id}
                name={deletingLanguage.name}
                open={Boolean(deletingLanguage)}
                onOpenChange={(open) => {
                  if (!open) {
                    setDeletingLanguage(null);
                  }
                }}
                onSuccess={async () => {
                  await handleRefresh();
                  setDeletingLanguage(null);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
