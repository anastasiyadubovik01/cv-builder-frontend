'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';

import type { SortDirection, SortField, User } from '@/features/users/types';
import { SortArrowIcon } from '@/components/icons/sort-arrow-icon';

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

  return (
    <div className="w-full">
      <table className="w-full table-fixed border-collapse text-[14px] text-[var(--users-foreground)]">
        <thead>
          <tr className="h-[58px] border-b border-[var(--users-divider)] text-left">
            <th className="w-20" />

            <th
              className="w-[178px] font-medium leading-6 tracking-[0.15px]"
              aria-sort={
                sortBy === 'firstName'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              <button
                type="button"
                onClick={() => onSort('firstName')}
                className="flex items-center gap-1"
              >
                {t('users.table.firstName')}
                {sortBy === 'firstName' && (
                  <SortArrowIcon
                    className={`size-[18px] text-[var(--sort-arrow)] ${
                      sortDirection === 'desc' ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            </th>

            <th
              className="w-[178px] font-medium leading-6 tracking-[0.15px]"
              aria-sort={
                sortBy === 'lastName'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              <button
                type="button"
                onClick={() => onSort('lastName')}
                className="flex items-center gap-1"
              >
                {t('users.table.lastName')}
                {sortBy === 'lastName' && (
                  <SortArrowIcon
                    className={`size-[18px] text-[var(--sort-arrow)] ${
                      sortDirection === 'desc' ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            </th>

            <th className="hidden font-medium leading-6 tracking-[0.15px] xl:table-cell">
              {t('users.table.email')}
            </th>

            <th
              className="font-medium leading-6 tracking-[0.15px]"
              aria-sort={
                sortBy === 'department'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              <button
                type="button"
                onClick={() => onSort('department')}
                className="flex items-center gap-1"
              >
                {t('users.table.department')}
                {sortBy === 'department' && (
                  <SortArrowIcon
                    className={`size-[18px] text-[var(--sort-arrow)] ${
                      sortDirection === 'desc' ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            </th>

            <th
              className="hidden w-[220px] font-medium leading-6 tracking-[0.15px] xl:table-cell"
              aria-sort={
                sortBy === 'position'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
            >
              <button
                type="button"
                onClick={() => onSort('position')}
                className="flex items-center gap-1"
              >
                {t('users.table.position')}
                {sortBy === 'position' && (
                  <SortArrowIcon
                    className={`size-[18px] text-[var(--sort-arrow)] ${
                      sortDirection === 'desc' ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            </th>

            <th className="w-10" />
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr className="h-[219px] border-b border-[var(--users-divider)]">
              <td
                colSpan={7}
                className="text-center align-middle text-[14px] leading-[20px] tracking-[0.15px]"
              >
                {t('users.noResults')}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="h-[73px] border-b border-[var(--users-divider)]"
              >
                <td className="w-20 px-4">
                  <div
                    className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[var(--users-avatar-background)] bg-cover bg-center text-xl leading-5 tracking-[0.15px] text-[var(--users-avatar-foreground)]"
                    style={
                      user.avatar
                        ? { backgroundImage: `url(${user.avatar})` }
                        : undefined
                    }
                  >
                    {!user.avatar && user.firstName.charAt(0).toUpperCase()}
                  </div>
                </td>

                <td className="w-[178px] leading-5 tracking-[0.15px]">
                  {user.firstName}
                </td>

                <td className="w-[178px] leading-5 tracking-[0.15px]">
                  {user.lastName}
                </td>

                <td className="hidden leading-5 tracking-[0.15px] xl:table-cell">
                  {user.email}
                </td>

                <td className="leading-5 tracking-[0.15px]">
                  {user.department}
                </td>

                <td className="hidden w-[220px] leading-5 tracking-[0.15px] xl:table-cell">
                  {user.position}
                </td>

                <td className="w-10">
                  <Link
                    href={`/users/${user.id}`}
                    aria-label={`Open ${user.firstName} ${user.lastName}`}
                    className="flex size-10 items-center justify-center text-[var(--users-arrow)]"
                  >
                    <ChevronLeftIcon className="size-5 rotate-180" />
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
