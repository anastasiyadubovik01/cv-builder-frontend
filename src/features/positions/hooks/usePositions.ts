import { useCallback } from 'react';
import { usePaginatedQuery } from '@/components/hooks/usePaginatedQuery';
import {
  POSITIONS_QUERY,
  type Position,
  type PositionsQueryResponse,
} from '@/api/positions';
import type { PositionSortField } from '../types';

export function usePositions() {
  const extractPaginatedData = useCallback((data: PositionsQueryResponse) => {
    if ('positions' in data && data.positions) {
      return data.positions;
    }
    return { items: [], total: 0, total_pages: 0 };
  }, []);

  const filterItem = useCallback((position: Position, queryStr: string) => {
    return position.name.toLowerCase().includes(queryStr);
  }, []);

  const getSortValue = useCallback(
    (position: Position, field: PositionSortField) => {
      switch (field) {
        case 'name':
          return position.name;
        default:
          return '';
      }
    },
    [],
  );

  return usePaginatedQuery<
    PositionsQueryResponse,
    Record<string, unknown>,
    Position,
    PositionSortField
  >({
    query: POSITIONS_QUERY,
    defaultSortBy: 'name',
    extractPaginatedData,
    filterItem,
    getSortValue,
  });
}
