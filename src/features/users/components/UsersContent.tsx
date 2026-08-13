'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client/react';

import { USERS_QUERY } from '@/api/users';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { UsersTable } from '@/features/users/components/UsersTable';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

import type { ApiUser } from '@/api/users';
import type { SortDirection, SortField, User } from '@/features/users/types';

export function UsersContent() {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('department');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);

  const { data, fetchMore } = useQuery(USERS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: BACKEND_PAGE_SIZE,
      },
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    const loadAllUsers = async () => {
      const firstPageUsers = data.users.items;
      const totalBackendPages = data.users.total_pages;

      if (totalBackendPages <= 1) {
        setAllUsers(firstPageUsers);
        return;
      }

      const pagesToLoad = Array.from(
        { length: totalBackendPages - 1 },
        (_, index) => index + 2,
      );

      const responses = await Promise.all(
        pagesToLoad.map((page) =>
          fetchMore({
            variables: {
              params: {
                page,
                limit: BACKEND_PAGE_SIZE,
              },
            },
          }),
        ),
      );

      const remainingUsers = responses.flatMap(
        (response) => response.data.users.items,
      );

      setAllUsers([...firstPageUsers, ...remainingUsers]);
    };

    void loadAllUsers();
  }, [data, fetchMore]);

  const users: User[] = allUsers.map((user) => ({
    id: user.id,
    firstName: user.profile.first_name ?? '',
    lastName: user.profile.last_name ?? '',
    email: user.email,
    department: user.department?.name ?? '',
    position: user.position?.name ?? '',
    avatar: user.profile.avatar ?? undefined,
  }));

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    return (
      user.firstName.toLowerCase().includes(normalizedSearch) ||
      user.lastName.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const firstValue = a[sortBy].trim();
    const secondValue = b[sortBy].trim();

    if (!firstValue && !secondValue) return 0;
    if (!firstValue) return 1;
    if (!secondValue) return -1;

    return sortDirection === 'asc'
      ? firstValue.localeCompare(secondValue)
      : secondValue.localeCompare(firstValue);
  });

  const totalPages = Math.ceil(sortedUsers.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setCurrentPage(1);
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
    setCurrentPage(1);
  };

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
