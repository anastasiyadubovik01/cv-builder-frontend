'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ApiSkill } from '@/api/skills';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';
import type { SkillSortField, SortDirection } from '@/features/skills/types';

type SkillsTableProps = {
  skills: ApiSkill[];
  categoryTypes: Record<string, string>;
  sortBy: SkillSortField;
  sortDirection: SortDirection;
  onSort: (field: SkillSortField) => void;
  onEdit: (skill: ApiSkill) => void;
  onDelete: (skill: ApiSkill) => void;
};

export function SkillsTable({
  skills,
  categoryTypes,
  sortBy,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: SkillsTableProps) {
  const { t } = useTranslation();

  const [openMenuSkillId, setOpenMenuSkillId] = useState<string | null>(null);

  const columns: DataTableColumn<ApiSkill, SkillSortField>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: t('skills.admin.name'),
      render: (skill) => skill.name,
    },
    {
      id: 'type',
      header: t('skills.admin.type'),
      className: 'hidden lg:table-cell',
      render: (skill) =>
        categoryTypes[skill.category.id] ??
        skill.category.parent?.name ??
        skill.category_parent_name ??
        '',
    },
    {
      id: 'category',
      header: t('skills.admin.category'),
      render: (skill) => skill.category_name ?? skill.category.name,
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (skill) => (
        <RowActionsMenu
          open={openMenuSkillId === skill.id}
          onOpenChange={(open) => setOpenMenuSkillId(open ? skill.id : null)}
          ariaLabel={`Actions for ${skill.name}`}
          actions={[
            {
              label: t('dialogs.actions.edit'),
              onClick: () => onEdit(skill),
            },
            {
              label: t('dialogs.actions.delete'),
              onClick: () => onDelete(skill),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={skills}
      columns={columns}
      getRowKey={(skill) => skill.id}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyState={t('skills.admin.empty')}
    />
  );
}
