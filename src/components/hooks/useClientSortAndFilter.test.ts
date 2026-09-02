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

  it('uses provided default sort direction', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
        defaultSortDirection: 'desc',
      }),
    );

    expect(result.current.sortDirection).toBe('desc');
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
      {
        id: 2,
        name: 'Nastya',
        age: 50,
      },
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
      {
        id: 2,
        name: 'Nastya',
        age: 50,
      },
    ]);
  });

  it('does not filter items when filterItem is missing', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    act(() => {
      result.current.setSearch('nastya');
    });

    expect(result.current.sortedItems).toHaveLength(3);
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

  it('sorts string values in descending order', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
        defaultSortDirection: 'desc',
      }),
    );

    expect(result.current.sortedItems.map((item) => item.name)).toEqual([
      'Nastya',
      'Leonid',
      'Dmitry',
    ]);
  });

  it('toggles ascending sort to descending', () => {
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
  });

  it('toggles descending sort back to ascending', () => {
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
      result.current.handleSort('name');
    });

    expect(result.current.sortDirection).toBe('asc');
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

  it('sorts numeric values in ascending order', () => {
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

  it('sorts numeric values in descending order', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'age',
        defaultSortDirection: 'desc',
      }),
    );

    expect(result.current.sortedItems.map((item) => item.age)).toEqual([
      50, 30, 10,
    ]);
  });

  it('keeps original order when getSortValue is missing', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        defaultSortBy: 'name',
      }),
    );

    expect(result.current.sortedItems).toEqual(items);
  });

  it('keeps original order when sortBy is missing', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
      }),
    );

    expect(result.current.sortBy).toBeUndefined();

    expect(result.current.sortedItems).toEqual(items);
  });

  it('does not mutate original items array while sorting', () => {
    const original = [...items];

    renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    expect(items).toEqual(original);
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

  it('works without onStateChange callback', () => {
    const { result } = renderHook(() =>
      useClientSortAndFilter<Item, SortField>({
        items,
        filterItem,
        getSortValue,
        defaultSortBy: 'name',
      }),
    );

    expect(() => {
      act(() => {
        result.current.setSearch('test');
        result.current.handleSort('name');
      });
    }).not.toThrow();
  });

  it('puts empty string values after non-empty values', () => {
    type NullableItem = {
      id: number;
      value: string;
    };

    const nullableItems: NullableItem[] = [
      { id: 1, value: '' },
      { id: 2, value: 'Beta' },
      { id: 3, value: 'Alpha' },
    ];

    const { result } = renderHook(() =>
      useClientSortAndFilter<NullableItem, 'value'>({
        items: nullableItems,
        defaultSortBy: 'value',
        getSortValue: (item) => item.value,
      }),
    );

    expect(result.current.sortedItems.map((item) => item.value)).toEqual([
      'Alpha',
      'Beta',
      '',
    ]);
  });

  it('handles empty value on the second compared item', () => {
    type NullableItem = {
      id: number;
      value: string;
    };

    const nullableItems: NullableItem[] = [
      { id: 1, value: 'Beta' },
      { id: 2, value: '' },
      { id: 3, value: 'Alpha' },
    ];

    const { result } = renderHook(() =>
      useClientSortAndFilter<NullableItem, 'value'>({
        items: nullableItems,
        defaultSortBy: 'value',
        getSortValue: (item) => item.value,
      }),
    );

    expect(result.current.sortedItems.map((item) => item.value)).toEqual([
      'Alpha',
      'Beta',
      '',
    ]);
  });

  it('handles two empty values as equal', () => {
    type NullableItem = {
      id: number;
      value: string;
    };

    const nullableItems: NullableItem[] = [
      { id: 1, value: '' },
      { id: 2, value: '' },
    ];

    const { result } = renderHook(() =>
      useClientSortAndFilter<NullableItem, 'value'>({
        items: nullableItems,
        defaultSortBy: 'value',
        getSortValue: (item) => item.value,
      }),
    );

    expect(result.current.sortedItems).toEqual(nullableItems);
  });

  it('treats null and undefined sort values as empty strings', () => {
    type NullableItem = {
      id: number;
      value?: string | null;
    };

    const nullableItems: NullableItem[] = [
      { id: 1, value: null },
      { id: 2, value: 'Beta' },
      { id: 3, value: undefined },
      { id: 4, value: 'Alpha' },
    ];

    const { result } = renderHook(() =>
      useClientSortAndFilter<NullableItem, 'value'>({
        items: nullableItems,
        defaultSortBy: 'value',
        getSortValue: (item) => item.value,
      }),
    );

    expect(
      result.current.sortedItems.slice(0, 2).map((item) => item.value),
    ).toEqual(['Alpha', 'Beta']);

    expect(
      result.current.sortedItems
        .slice(2)
        .every((item) => item.value === null || item.value === undefined),
    ).toBe(true);
  });

  it('trims string values before sorting', () => {
    type StringItem = {
      id: number;
      value: string;
    };

    const stringItems: StringItem[] = [
      {
        id: 1,
        value: '  Beta  ',
      },
      {
        id: 2,
        value: 'Alpha',
      },
    ];

    const { result } = renderHook(() =>
      useClientSortAndFilter<StringItem, 'value'>({
        items: stringItems,
        defaultSortBy: 'value',
        getSortValue: (item) => item.value,
      }),
    );

    expect(result.current.sortedItems.map((item) => item.id)).toEqual([2, 1]);
  });
});
