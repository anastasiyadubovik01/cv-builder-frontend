'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { useState } from 'react';
import { MoreVerticalIcon } from '@/components/icons/more-vertical-icon';

import type { SortDirection, SortField, User } from '@/features/users/types';

type UsersTableProps = {
  users: User[];
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  isAdmin: boolean;
};

export function UsersTable({
  users,
  sortBy,
  sortDirection,
  onSort,
  isAdmin,
}: UsersTableProps) {
  const { t } = useTranslation();
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

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
      render: (user) => {
        if (!isAdmin) {
          return (
            <Link
              href={`/users/${user.id}`}
              aria-label={`Open ${user.firstName} ${user.lastName}`}
              className="flex size-10 items-center justify-center text-[var(--users-arrow)]"
            >
              <ChevronLeftIcon className="size-5 rotate-180" />
            </Link>
          );
        }

        const isOpen = openMenuUserId === user.id;

        return (
          <div className="relative">
            <button
              type="button"
              aria-label={`Actions for ${user.firstName} ${user.lastName}`}
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() =>
                setOpenMenuUserId((current) =>
                  current === user.id ? null : user.id,
                )
              }
              className="flex size-10 cursor-pointer items-center justify-center"
            >
              <MoreVerticalIcon className="size-6 text-[#626262] dark:text-[#F5F5F7]" />
            </button>

            {isOpen && (
              <div
                role="menu"
                className="absolute right-0 z-20 w-[140px] rounded-xl border bg-background py-2 shadow-md"
              >
                <Link
                  href={`/users/${user.id}`}
                  role="menuitem"
                  onClick={() => setOpenMenuUserId(null)}
                  className="block px-5 py-2 text-base hover:bg-muted"
                >
                  {t('dialogs.actions.view')}
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  className="block w-full cursor-pointer px-5 py-2 text-left text-base hover:bg-muted"
                >
                  {t('dialogs.actions.update')}
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="block w-full cursor-pointer px-5 py-2 text-left text-base hover:bg-muted"
                >
                  {t('dialogs.actions.delete')}
                </button>
              </div>
            )}
          </div>
        );
      },
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
