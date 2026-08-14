'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

import type { SortDirection, SortField, User } from '@/features/users/types';

type UsersTableProps = {
  users: User[];
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
};

export function UsersTable({
  users,
  sortBy,
  sortDirection,
  onSort,
}: UsersTableProps) {
  const { t } = useTranslation();

  const columns: DataTableColumn<User, SortField>[] = [
    {
      id: 'avatar',
      header: '',
      widthClassName: 'w-20',
      render: (user) => (
        <div className="px-4">
          <div
            className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[var(--users-avatar-background)] bg-cover bg-center text-xl text-[var(--users-avatar-foreground)]"
            style={
              user.avatar
                ? { backgroundImage: `url(${user.avatar})` }
                : undefined
            }
          >
            {!user.avatar && user.firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      ),
    },
    {
      id: 'firstName',
      sortKey: 'firstName',
      header: t('users.table.firstName'),
      widthClassName: 'w-[178px]',
      render: (user) => user.firstName,
    },
    {
      id: 'lastName',
      sortKey: 'lastName',
      header: t('users.table.lastName'),
      widthClassName: 'w-[178px]',
      render: (user) => user.lastName,
    },
    {
      id: 'email',
      header: t('users.table.email'),
      className: 'hidden xl:table-cell',
      render: (user) => user.email,
    },
    {
      id: 'department',
      sortKey: 'department',
      header: t('users.table.department'),
      render: (user) => user.department,
    },
    {
      id: 'position',
      sortKey: 'position',
      header: t('users.table.position'),
      widthClassName: 'w-[220px]',
      className: 'hidden xl:table-cell',
      render: (user) => user.position,
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (user) => (
        <Link
          href={`/users/${user.id}`}
          aria-label={`Open ${user.firstName} ${user.lastName}`}
          className="flex size-10 items-center justify-center text-[var(--users-arrow)]"
        >
          <ChevronLeftIcon className="size-5 rotate-180" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      getRowKey={(user) => user.id}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyState={t('users.noResults')}
    />
  );
}
