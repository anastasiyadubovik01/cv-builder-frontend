'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@/components/icons/plus-icon';
import { Button } from '@/components/ui/button';
import { ContentLayout } from '@/components/common/ContentLayout';
import { useLanguages } from '@/features/languages/hooks/useLanguages';

import { CreateLanguageModal } from './CreateLanguageModal';
import { DeleteLanguageModal } from './DeleteLanguageModal';
import { LanguagesTable } from './LanguagesTable';
import { UpdateLanguageModal } from './UpdateLanguageModal';

import type { ApiLanguage } from '@/api/languages';

export function AdminLanguagesContent() {
  const { t } = useTranslation();

  const [editingLanguage, setEditingLanguage] = useState<ApiLanguage | null>(
    null,
  );

  const [deletingLanguage, setDeletingLanguage] = useState<ApiLanguage | null>(
    null,
  );

  const {
    paginatedItems: languages,
    allItems: allLanguages,
    loading,
    error,
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    handleRefresh,
  } = useLanguages();

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('languages.admin.loadError', 'Failed to load languages')}
      onRetry={handleRefresh}
      search={search}
      onSearchChange={setSearch}
      actionTrigger={
        <CreateLanguageModal
          languages={allLanguages}
          onSuccess={() => void handleRefresh()}
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
      }
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
    >
      <LanguagesTable
        languages={languages}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={setEditingLanguage}
        onDelete={setDeletingLanguage}
      />

      {editingLanguage && (
        <UpdateLanguageModal
          language={editingLanguage}
          languages={allLanguages}
          open
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
          open
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
    </ContentLayout>
  );
}
