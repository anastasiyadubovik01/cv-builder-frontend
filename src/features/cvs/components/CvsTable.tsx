'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';
import { UpdateCvModal } from '@/features/cvs/components/modals/UpdateCvModal';
import { DeleteCvModal } from '@/features/cvs/components/modals/DeleteCvModal';

import type { Cv, SortDirection, SortField } from '@/features/cvs/types';

type CvsTableProps = {
  cvs: Cv[];
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  isAdmin?: boolean;
  onRefresh?: () => Promise<void>;
};

export function CvsTable({
  cvs,
  sortBy,
  sortDirection,
  onSort,
  isAdmin = false,
  onRefresh,
}: CvsTableProps) {
  const { t } = useTranslation();

  const emptyStateMessage = isAdmin
    ? t('cvs.emptyState.admin', 'No CVs found')
    : t('cvs.emptyState.employee', 'You have no CVs yet');

  const [openMenuCvId, setOpenMenuCvId] = useState<string | null>(null);
  const [editingCv, setEditingCv] = useState<Cv | null>(null);
  const [deletingCv, setDeletingCv] = useState<Cv | null>(null);

  const columns: DataTableColumn<Cv, SortField>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: t('cvs.name', 'Name'),
      render: (cv) => cv.name,
    },
    {
      id: 'education',
      header: t('cvs.education', 'Education'),
      render: (cv) => cv.education,
    },
    {
      id: 'employee',
      header: t('cvs.employee', 'Employee'),
      render: (cv) => cv.employee,
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (cv) => (
        <RowActionsMenu
          open={openMenuCvId === cv.id}
          onOpenChange={(open) => setOpenMenuCvId(open ? cv.id : null)}
          ariaLabel={`Actions for ${cv.name}`}
          actions={[
            {
              label: t('dialogs.actions.view', 'View'),
              href: `/cvs/${cv.id}`,
            },
            {
              label: t('dialogs.actions.update', 'Update'),
              onClick: () => setEditingCv(cv),
            },
            {
              label: t('dialogs.actions.delete', 'Delete'),
              onClick: () => setDeletingCv(cv),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={cvs}
        columns={columns}
        getRowKey={(cv) => cv.id}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={onSort}
        emptyState={emptyStateMessage}
        renderSubRow={(cv) =>
          cv.description ? (
            <p
              className="text-[16px] font-regular leading-relaxed"
              style={{ color: 'var(--users-foreground)', opacity: 0.5 }}
            >
              {cv.description}
            </p>
          ) : null
        }
      />

      {editingCv && (
        <UpdateCvModal
          cvId={editingCv.id}
          open={Boolean(editingCv)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingCv(null);
            }
          }}
          initialValues={{
            name: editingCv.name,
            education: editingCv.education,
            description: editingCv.description,
          }}
          onSuccess={async () => {
            await onRefresh?.();
            setEditingCv(null);
          }}
        />
      )}

      {deletingCv && (
        <DeleteCvModal
          cvId={deletingCv.id}
          name={deletingCv.name}
          open={Boolean(deletingCv)}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingCv(null);
            }
          }}
          onSuccess={async () => {
            await onRefresh?.();
            setDeletingCv(null);
          }}
        />
      )}
    </>
  );
}
