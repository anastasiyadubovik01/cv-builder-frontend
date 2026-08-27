'use client';

import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseClientSortAndFilterOptions<
  TItem,
  TSortField extends string,
> {
  items: TItem[];
  filterItem?: (item: TItem, search: string) => boolean;
  getSortValue?: (
    item: TItem,
    field: TSortField,
  ) => string | number | null | undefined;
  defaultSortBy?: TSortField;
  defaultSortDirection?: SortDirection;
  onStateChange?: () => void;
}

export interface UseClientSortAndFilterResult<
  TItem,
  TSortField extends string,
> {
  search: string;
  setSearch: (value: string) => void;
  sortBy: TSortField;
  sortDirection: SortDirection;
  handleSort: (field: TSortField) => void;
  sortedItems: TItem[];
}

export function useClientSortAndFilter<TItem, TSortField extends string>({
  items,
  filterItem,
  getSortValue,
  defaultSortBy,
  defaultSortDirection = 'asc',
  onStateChange,
}: UseClientSortAndFilterOptions<
  TItem,
  TSortField
>): UseClientSortAndFilterResult<TItem, TSortField> {
  const [search, setSearchState] = useState('');
  const [sortBy, setSortBy] = useState<TSortField>(defaultSortBy as TSortField);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSortDirection);

  const setSearch = (value: string) => {
    setSearchState(value);
    onStateChange?.();
  };

  const handleSort = (field: TSortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
    onStateChange?.();
  };

  const sortedItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = filterItem
      ? items.filter((item) => filterItem(item, normalizedSearch))
      : items;

    return [...filtered].sort((a, b) => {
      if (!getSortValue || !sortBy) return 0;

      const rawA = getSortValue(a, sortBy);
      const rawB = getSortValue(b, sortBy);

      const valA = rawA ?? '';
      const valB = rawB ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).trim();
      const strB = String(valB).trim();

      if (!strA && !strB) return 0;
      if (!strA) return 1;
      if (!strB) return -1;

      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [items, search, filterItem, getSortValue, sortBy, sortDirection]);

  return {
    search,
    setSearch,
    sortBy,
    sortDirection,
    handleSort,
    sortedItems,
  };
}
