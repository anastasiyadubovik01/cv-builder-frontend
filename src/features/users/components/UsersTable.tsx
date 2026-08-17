'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';

import type { SortDirection, SortField, User } from '@/features/users/types';
import { DeleteUserModal } from '@/features/users/components/DeleteUserModal';
import { UpdateUserModal } from '@/features/users/components/UpdateUserModal';

type UsersTableProps = {
  users: User[];
  sortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  isAdmin: boolean;
  onRefresh?: () => Promise<void>;
};

export function UsersTable({
  users,
  sortBy,
  sortDirection,
  onSort,
  isAdmin,
  onRefresh,
}: UsersTableProps) {
  const { t } = useTranslation();
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
      widthClassName: 'w-[220px]',
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
      widthClassName: 'w-14',
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
          <RowActionsMenu
            open={isOpen}
            onOpenChange={(open) => setOpenMenuUserId(open ? user.id : null)}
            ariaLabel={`Actions for ${user.firstName} ${user.lastName}`}
            actions={[
              {
                label: t('dialogs.actions.view'),
                href: `/users/${user.id}`,
              },
              {
                label: t('dialogs.actions.update'),
                onClick: () => setEditingUser(user),
              },
              {
                label: t('dialogs.actions.delete'),
                onClick: () => setDeletingUser(user),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        getRowKey={(user) => user.id}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={onSort}
        emptyState={t('users.noResults')}
      />

      {editingUser && (
        <UpdateUserModal
          userId={editingUser.id}
          open={Boolean(editingUser)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingUser(null);
            }
          }}
          onSuccess={async () => {
            await onRefresh?.();
            setEditingUser(null);
          }}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          userId={deletingUser.id}
          name={`${deletingUser.firstName} ${deletingUser.lastName}`}
          open={Boolean(deletingUser)}
          onOpenChange={(open) => {
            if (!open) {
              setDeletingUser(null);
            }
          }}
          onSuccess={async () => {
            await onRefresh?.();
            setDeletingUser(null);
          }}
        />
      )}
    </>
  );
}
