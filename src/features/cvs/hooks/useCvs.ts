import { useCallback, useMemo } from 'react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import {
  CVS_BY_USER_ID_QUERY,
  CVS_QUERY,
  type ApiCv,
  type CvsData,
  type CvsByUserIdData,
} from '@/api/cvs';
import type { SortField } from '@/features/cvs/types';

type CombinedCvResponse = CvsData | CvsByUserIdData;

export function useCvs(userId?: string) {
  const isUserSpecific = Boolean(userId);
  const query = isUserSpecific ? CVS_BY_USER_ID_QUERY : CVS_QUERY;
  const variables = useMemo(
    () => (isUserSpecific ? { userId: userId ?? '' } : undefined),
    [isUserSpecific, userId],
  );

  const extractPaginatedData = useCallback((data: CombinedCvResponse) => {
    if ('cvsByUserId' in data && data.cvsByUserId) {
      return data.cvsByUserId;
    }
    if ('cvs' in data && data.cvs) {
      return data.cvs;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((cv: ApiCv, queryStr: string) => {
    const name = cv.name.toLowerCase();
    const education = (cv.education ?? '').toLowerCase();
    const employee = (cv.user?.email ?? '').toLowerCase();

    return (
      name.includes(queryStr) ||
      education.includes(queryStr) ||
      employee.includes(queryStr)
    );
  }, []);

  const getSortValue = useCallback((cv: ApiCv, field: SortField) => {
    switch (field) {
      case 'name':
        return cv.name;
      default:
        return '';
    }
  }, []);

  return usePaginatedQuery<
    CombinedCvResponse,
    Record<string, unknown>,
    ApiCv,
    SortField
  >({
    query,
    variables,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });
}
