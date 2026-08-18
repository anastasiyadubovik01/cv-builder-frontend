import { useQuery } from '@apollo/client/react';

import { DEPARTMENTS_QUERY, POSITIONS_QUERY } from '@/api/users';

export function useUserCatalogs() {
  const { data: departmentsData } = useQuery(DEPARTMENTS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  const { data: positionsData } = useQuery(POSITIONS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  return {
    departments: departmentsData?.departments.items ?? [],
    positions: positionsData?.positions.items ?? [],
  };
}
