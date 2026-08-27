import { useCallback } from 'react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import { getEmptyPaginatedResponse } from '@/components/hooks/useFetchAllPages';
import { USERS_QUERY, type ApiUser, type UsersData } from '@/api/users';
import type { SortField } from '@/features/users/types';

export function useUsers() {
  const extractPaginatedData = useCallback((data: UsersData) => {
    if ('users' in data && data.users) {
      return data.users;
    }
    return getEmptyPaginatedResponse<ApiUser>();
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

  return usePaginatedQuery<
    UsersData,
    Record<string, unknown>,
    ApiUser,
    SortField
  >({
    query: USERS_QUERY,
    defaultSortBy: 'department',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });
}
