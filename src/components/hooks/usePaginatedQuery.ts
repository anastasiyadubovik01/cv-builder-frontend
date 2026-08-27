'use client';

import { useEffect } from 'react';
import type { DocumentNode, OperationVariables } from '@apollo/client';
import {
  useFetchAllPages,
  type PaginatedBackendResponse,
} from './useFetchAllPages';
import {
  useClientSortAndFilter,
  type SortDirection,
} from './useClientSortAndFilter';
import { usePaginationState } from './usePaginationState';

export type { SortDirection, PaginatedBackendResponse };

export interface UsePaginatedQueryOptions<
  TData,
  TVariables extends OperationVariables,
  TItem,
  TSortField extends string,
> {
  query: DocumentNode;
  variables?: TVariables;
  skip?: boolean;
  extractPaginatedData: (data: TData) => PaginatedBackendResponse<TItem>;
  filterItem?: (item: TItem, search: string) => boolean;
  getSortValue?: (
    item: TItem,
    field: TSortField,
  ) => string | number | null | undefined;
  defaultSortBy?: TSortField;
  defaultSortDirection?: SortDirection;
}

export interface UsePaginatedQueryResult<TItem, TSortField extends string> {
  allItems: TItem[];
  paginatedItems: TItem[];
  loading: boolean;
  error: boolean;

  search: string;
  setSearch: (value: string) => void;

  sortBy: TSortField;
  sortDirection: SortDirection;
  handleSort: (field: TSortField) => void;

  currentPage: number;
  totalPages: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  handleRefresh: () => Promise<TItem[] | undefined>;
}

export function usePaginatedQuery<
  TData,
  TVariables extends OperationVariables,
  TItem,
  TSortField extends string,
>({
  query,
  variables,
  skip = false,
  extractPaginatedData,
  filterItem,
  getSortValue,
  defaultSortBy,
  defaultSortDirection = 'asc',
}: UsePaginatedQueryOptions<
  TData,
  TVariables,
  TItem,
  TSortField
>): UsePaginatedQueryResult<TItem, TSortField> {
  const {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    resetPagination,
  } = usePaginationState();

  const { allItems, loading, error, refetchAll } = useFetchAllPages({
    query,
    variables,
    skip,
    extractPaginatedData,
  });

  const { search, setSearch, sortBy, sortDirection, handleSort, sortedItems } =
    useClientSortAndFilter({
      items: allItems,
      filterItem,
      getSortValue,
      defaultSortBy,
      defaultSortDirection,
      onStateChange: resetPagination,
    });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (safeCurrentPage !== currentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage, setCurrentPage]);

  return {
    allItems,
    paginatedItems,
    loading,
    error,
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    currentPage: safeCurrentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    handleRefresh: refetchAll,
  };
}
