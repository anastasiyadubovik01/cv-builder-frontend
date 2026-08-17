'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { MoreVerticalIcon } from '@/components/icons/more-vertical-icon';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';

import type { Cv, SortDirection, SortField } from '@/features/cvs/types';

type CvsTableProps = {
  cvs: Cv[];
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  isAdmin?: boolean;
};

export function CvsTable({
  cvs,
  sortBy,
  sortDirection,
  onSort,
  isAdmin = false,
}: CvsTableProps) {
  const { t } = useTranslation();

  const emptyStateMessage = isAdmin
    ? t('cvs.emptyState.admin', 'No CVs found')
    : t('cvs.emptyState.employee', 'You have no CVs yet');

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
        <Link
          href={`/cvs/${cv.id}`}
          aria-label={`Open ${cv.name}`}
          className="flex size-10 items-center justify-center text-[var(--users-arrow)]"
        >
          <Button variant="icon" className="size-7">
            <MoreVerticalIcon className="size-5" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
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
  );
}
