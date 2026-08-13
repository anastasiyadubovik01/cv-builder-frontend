'use client';

import type { ReactNode } from 'react';

import { SortArrowIcon } from '@/components/icons/sort-arrow-icon';

type SortDirection = 'asc' | 'desc';

export type DataTableColumn<T, K extends string = string> = {
  id: string;
  sortKey?: K;
  header: string;
  widthClassName?: string;
  className?: string;
  render: (item: T) => ReactNode;
};

type DataTableProps<T, K extends string = string> = {
  data: T[];
  columns: DataTableColumn<T, K>[];
  getRowKey: (item: T) => string;
  sortBy?: K;
  sortDirection?: SortDirection;
  onSort?: (field: K) => void;
  emptyState: ReactNode;
};

export function DataTable<T, K extends string = string>({
  data,
  columns,
  getRowKey,
  sortBy,
  sortDirection,
  onSort,
  emptyState,
}: DataTableProps<T, K>) {
  return (
    <div className="w-full">
      <table className="w-full table-fixed border-collapse text-[14px]">
        <thead>
          <tr className="h-[48px] border-b border-[var(--users-divider)] text-left">
            {columns.map((column) => (
              <th
                key={column.id}
                className={`${column.widthClassName ?? ''} ${column.className ?? ''}`}
                aria-sort={
                  column.sortKey
                    ? sortBy === column.sortKey
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    : undefined
                }
              >
                {column.sortKey && onSort ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.sortKey!)}
                    className="flex items-center gap-1"
                  >
                    {column.header}

                    {sortBy === column.sortKey && (
                      <SortArrowIcon
                        className={`size-[18px] ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr className="h-[219px] border-b border-[var(--users-divider)]">
              <td
                colSpan={columns.length}
                className="text-center align-middle text-[14px]"
              >
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={getRowKey(item)}
                className="h-[56px] border-b border-[var(--users-divider)]"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`${column.widthClassName ?? ''} ${column.className ?? ''}`}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
