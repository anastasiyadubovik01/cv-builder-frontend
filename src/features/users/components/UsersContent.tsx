'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloClient } from '@apollo/client/react';

import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/icons/plus-icon';
import { ContentLayout } from '@/components/common/ContentLayout';
import { UsersTable } from '@/features/users/components/UsersTable';
import { CreateUserModal } from './CreateUserModal';
import { useUsers } from '@/features/users/hooks/useUsers';

import type { User } from '@/features/users/types';

type UsersContentProps = {
  isAdmin: boolean;
};

export function UsersContent({ isAdmin }: UsersContentProps) {
  const { t } = useTranslation();
  const client = useApolloClient();

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
  } = useUsers();

  const users: User[] = useMemo(
    () =>
      rawUsers.map((user) => ({
        id: user.id,
        firstName: user.profile.first_name ?? '',
        lastName: user.profile.last_name ?? '',
        email: user.email,
        department: user.department?.name ?? '',
        position: user.position?.name ?? '',
        avatar: user.profile.avatar ?? undefined,
      })),
    [rawUsers],
  );

  const handleRetry = async () => {
    await handleRefresh();

    await client
      .refetchQueries({
        include: ['Me'],
      })
      .catch(() => undefined);
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
