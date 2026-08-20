'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiLanguage } from '@/api/languages';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';

import type { LanguageSortField, SortDirection } from '../types';

type LanguagesTableProps = {
  languages: ApiLanguage[];
  sortBy: LanguageSortField;
  sortDirection: SortDirection;
  onSort: (field: LanguageSortField) => void;
  onEdit: (language: ApiLanguage) => void;
  onDelete: (language: ApiLanguage) => void;
};

export function LanguagesTable({
  languages,
  sortBy,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: LanguagesTableProps) {
  const { t } = useTranslation();

  const [openMenuLanguageId, setOpenMenuLanguageId] = useState<string | null>(
    null,
  );

  const columns: DataTableColumn<ApiLanguage, LanguageSortField>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: t('languages.admin.name'),
      render: (language) => language.name,
    },
    {
      id: 'iso2',
      sortKey: 'iso2',
      header: t('languages.admin.iso'),
      render: (language) => language.iso2,
    },
    {
      id: 'nativeName',
      header: t('languages.admin.nativeName'),
      className: 'hidden lg:table-cell',
      render: (language) => language.native_name ?? '',
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (language) => (
        <RowActionsMenu
          open={openMenuLanguageId === language.id}
          onOpenChange={(open) =>
            setOpenMenuLanguageId(open ? language.id : null)
          }
          ariaLabel={`Actions for ${language.name}`}
          actions={[
            {
              label: t('dialogs.actions.edit'),
              onClick: () => onEdit(language),
            },
            {
              label: t('dialogs.actions.delete'),
              onClick: () => onDelete(language),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={languages}
      columns={columns}
      getRowKey={(language) => language.id}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyState={t('languages.admin.empty')}
    />
  );
}
