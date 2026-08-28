import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useClientSortAndFilter } from './useClientSortAndFilter';

type Item = {
  id: number;
  name: string;
  age: number;
};

type SortField = 'name' | 'age';

const items: Item[] = [
  { id: 1, name: 'Leonid', age: 30 },
  { id: 2, name: 'Nastya', age: 50 },
  { id: 3, name: 'Dmitry', age: 10 },
];

const filterItem = (item: Item, search: string) =>
  item.name.toLowerCase().includes(search);

const getSortValue = (item: Item, field: SortField) => item[field];

describe('useClientSortAndFilter', () => {
  it('returns initial sort state', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.search).toBe('');
    expect(result.current.sortBy).toBe('name');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('filters items by search value', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    act(() => {
      result.current.setSearch('nastya');
    });

    expect(result.current.sortedItems).toEqual([
      { id: 2, name: 'Nastya', age: 50 },
    ]);
  });

  it('normalizes search value', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    act(() => {
      result.current.setSearch('  NASTYA  ');
    });

    expect(result.current.sortedItems).toEqual([
      { id: 2, name: 'Nastya', age: 50 },
    ]);
  });

  it('sorts string values in ascending order', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.sortedItems.map((item) => item.name)).toEqual([
      'Dmitry',
      'Leonid',
      'Nastya',
    ]);
  });

  it('toggles sort direction when sorting by the same field', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedItems.map((item) => item.name)).toEqual([
      'Nastya',
      'Leonid',
      'Dmitry',
    ]);
  });

  it('changes sort field and resets direction to ascending', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
        defaultSortDirection: 'desc',
      }),
    );

    act(() => {
      result.current.handleSort('age');
    });

    expect(result.current.sortBy).toBe('age');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('sorts numeric values', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'age',
      }),
    );

    expect(result.current.sortedItems.map((item) => item.age)).toEqual([
      10, 30, 50,
    ]);
  });

  it('calls onStateChange when search or sorting changes', () => {
    const onStateChange = vi.fn();

    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
        onStateChange,
      }),
    );

    act(() => {
      result.current.setSearch('nastya');
    });

    act(() => {
      result.current.handleSort('name');
    });

    expect(onStateChange).toHaveBeenCalledTimes(2);
  });
});
