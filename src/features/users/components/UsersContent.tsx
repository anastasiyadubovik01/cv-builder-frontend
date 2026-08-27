'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloClient } from '@apollo/client/react';

import { USERS_QUERY, type ApiUser, type UsersData } from '@/api/users';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';
import { ContentLayout } from '@/components/common/ContentLayout';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import { UsersTable } from '@/features/users/components/UsersTable';
import { CreateUserModal } from './CreateUserModal';

import type { SortField, User } from '@/features/users/types';

type UsersContentProps = {
  isAdmin: boolean;
};

export function UsersContent({ isAdmin }: UsersContentProps) {
  const { t } = useTranslation();
  const client = useApolloClient();

  const extractPaginatedData = useCallback((data: UsersData) => {
    if ('users' in data && data.users) {
      return data.users;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((user: ApiUser, queryStr: string) => {
    const firstName = user.profile.first_name?.toLowerCase() ?? '';
    const lastName = user.profile.last_name?.toLowerCase() ?? '';
    const email = user.email.toLowerCase();

    return (
      firstName.includes(queryStr) ||
      lastName.includes(queryStr) ||
      email.includes(queryStr)
    );
  }, []);

  const getSortValue = useCallback((user: ApiUser, field: SortField) => {
    switch (field) {
      case 'firstName':
        return user.profile.first_name ?? '';
      case 'lastName':
        return user.profile.last_name ?? '';
      case 'department':
        return user.department?.name ?? '';
      case 'position':
        return user.position?.name ?? '';
      default:
        return '';
    }
  }, []);

  const {
    paginatedItems: rawUsers,
    loading,
    error,
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    handleRefresh,
  } = usePaginatedQuery<UsersData, Record<string, unknown>, ApiUser, SortField>(
    {
      query: USERS_QUERY,
      defaultSortBy: 'department',
      extractPaginatedData,
      filterItem,
      getSortValue,
    },
  );

  const users: User[] = rawUsers.map((user) => ({
    id: user.id,
    firstName: user.profile.first_name ?? '',
    lastName: user.profile.last_name ?? '',
    email: user.email,
    department: user.department?.name ?? '',
    position: user.position?.name ?? '',
    avatar: user.profile.avatar ?? undefined,
  }));

  const handleRetry = async () => {
    try {
      await handleRefresh();

      await client
        .refetchQueries({
          include: ['Me'],
        })
        .catch(() => undefined);
    } catch (error) {
      throw error;
    }
  };

  return (
    <ContentLayout
      isLoading={loading}
      hasError={error}
      errorMessage={t('users.loadError', 'Failed to load users')}
      onRetry={handleRetry}
      search={search}
      onSearchChange={setSearch}
      actionTrigger={
        isAdmin ? (
          <CreateUserModal
            onSuccess={() => void handleRefresh()}
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
        ) : undefined
      }
      pagination={{
        currentPage,
        totalPages,
        pageSize,
        onPageChange: setCurrentPage,
        onPageSizeChange: setPageSize,
      }}
    >
      <UsersTable
        users={users}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        isAdmin={isAdmin}
        onRefresh={async () => {
          await handleRefresh();
        }}
      />
    </ContentLayout>
  );
}
