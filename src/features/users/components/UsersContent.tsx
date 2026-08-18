'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@apollo/client/react';

import { USERS_QUERY } from '@/api/users';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { UsersTable } from '@/features/users/components/UsersTable';
import { CreateUserModal } from './CreateUserModal';
import {
  BACKEND_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from '@/lib/constants/pagination';

import type { ApiUser } from '@/api/users';
import type { SortDirection, SortField, User } from '@/features/users/types';

type UsersContentProps = {
  isAdmin: boolean;
};

export function UsersContent({ isAdmin }: UsersContentProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('department');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [loadError, setLoadError] = useState(false);

  const { data, loading, error, fetchMore, refetch, client } = useQuery(
    USERS_QUERY,
    {
      variables: {
        params: {
          page: 1,
          limit: BACKEND_PAGE_SIZE,
        },
      },
    },
  );

  const loadAllUsers = useCallback(
    async (sourceData: NonNullable<typeof data>): Promise<ApiUser[]> => {
      const firstPageUsers = sourceData.users.items;
      const totalBackendPages = sourceData.users.total_pages;

      if (totalBackendPages <= 1) {
        return firstPageUsers;
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

      return [...firstPageUsers, ...remainingUsers];
    },
    [fetchMore],
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const syncUsers = async () => {
      try {
        const users = await loadAllUsers(data);

        setAllUsers(users);
        setLoadError(false);
      } catch {
        setLoadError(true);
      }
    };

    void syncUsers();
  }, [data, loadAllUsers]);

  const handleRefresh = async (): Promise<void> => {
    const result = await refetch();

    if (!result.data) {
      return;
    }

    try {
      const users = await loadAllUsers(result.data);

      setAllUsers(users);
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  };

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

  const handleRetry = async () => {
    setLoadError(false);

    try {
      await handleRefresh();

      void client
        .refetchQueries({
          include: ['Me'],
        })
        .catch(() => undefined);
    } catch {
      setLoadError(true);
    }
  };

  const hasError = Boolean(error) || loadError;

  const isLoading =
    loading || Boolean(data && allUsers.length < data.users.total);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      {!hasError && isLoading && <LoadingOverlay />}

      <div className="mx-6 mt-[7px] flex shrink-0 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('users.search')}
          className="bg-background"
        />

        {isAdmin && (
          <CreateUserModal
            onSuccess={handleRefresh}
            trigger={
              <Button
                type="button"
                variant="primaryV2"
                className="w-10 border-transparent px-0 lg:w-auto lg:gap-3 lg:border-transparent lg:px-5 lg:hover:border-primary"
              >
                <PlusIcon className="size-6" />

                <span className="hidden lg:inline">
                  {t('users.create.button')}
                </span>
              </Button>
            }
          />
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-4">
        {hasError ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
            <p className="text-base text-foreground">{t('users.loadError')}</p>

            <Button type="button" onClick={() => void handleRetry()}>
              {t('retry')}
            </Button>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              <UsersTable
                users={paginatedUsers}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                isAdmin={isAdmin}
                onRefresh={handleRefresh}
              />
            </div>

            <div className="shrink-0 bg-background pb-4">
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
        )}
      </div>
    </div>
  );
}
