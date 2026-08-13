'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchInput } from '@/components/ui/search-input';
import { UsersTable } from '@/features/users/components/UsersTable';

import type { SortDirection, SortField, User } from '@/features/users/types';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';

type UsersContentProps = {
  users: User[];
};

export function UsersContent({ users }: UsersContentProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const [sortBy, setSortBy] = useState<SortField>('department');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const normalizedSearch = search.trim().toLowerCase();

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
  };

  const filteredUsers = users.filter((user) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      user.firstName.toLowerCase().includes(normalizedSearch) ||
      user.lastName.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortBy].toLowerCase();
    const bValue = b[sortBy].toLowerCase();

    const result = aValue.localeCompare(bValue);

    return sortDirection === 'asc' ? result : -result;
  });

  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  return (
    <>
      <div className="sticky top-14 z-20 ml-6 mt-[7px] w-fit">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('users.search')}
          className="bg-background"
        />
      </div>

      <div className="mt-4 px-5 pb-8">
        <UsersTable
          users={paginatedUsers}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />

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
    </>
  );
}
