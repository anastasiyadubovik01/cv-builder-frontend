import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PositionsTable } from './PositionsTable';
import type { Position } from '@/api/positions';
import React from 'react';

const mockDataTable = vi.fn();
const mockRowActionsMenu = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'positions.name': 'Name',
        'dialogs.actions.edit': 'Edit',
        'dialogs.actions.delete': 'Delete',
        'positions.empty': 'No positions found',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('@/components/ui/data-table', () => ({
  DataTable: (props: unknown) => {
    mockDataTable(props);
    const typedProps = props as {
      data: Position[];
      columns: Array<{
        id: string;
        header: string;
        render: (pos: Position) => React.ReactNode;
      }>;
      emptyState: string;
      sortBy: string;
      sortDirection: string;
      onSort: (field: string) => void;
      getRowKey: (position: Position) => string;
    };
    return (
      <div data-testid="data-table" data-empty-state={typedProps.emptyState}>
        {typedProps.data.map((pos) => {
          const rowKey = typedProps.getRowKey
            ? typedProps.getRowKey(pos)
            : pos.id;
          return (
            <div key={rowKey} data-testid={`table-row-${rowKey}`}>
              {typedProps.columns.map((col) => (
                <div key={col.id} data-testid={`col-${col.id}`}>
                  {col.render(pos)}
                </div>
              ))}
            </div>
          );
        })}
        <button
          data-testid="sort-btn"
          onClick={() => typedProps.onSort('name')}
        >
          Sort
        </button>
      </div>
    );
  },
}));

vi.mock('@/components/ui/row-actions-menu', () => ({
  RowActionsMenu: (props: unknown) => {
    mockRowActionsMenu(props);
    const typedProps = props as {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      ariaLabel: string;
      actions: Array<{ label: string; onClick: () => void }>;
    };
    return (
      <div
        data-testid="row-actions-menu"
        data-open={String(typedProps.open)}
        data-arialabel={typedProps.ariaLabel}
      >
        <button
          data-testid="menu-toggle"
          onClick={() => typedProps.onOpenChange(!typedProps.open)}
        >
          Toggle Menu
        </button>
        <button
          data-testid="menu-open-true"
          onClick={() => typedProps.onOpenChange(true)}
        >
          Open True
        </button>
        <button
          data-testid="menu-open-false"
          onClick={() => typedProps.onOpenChange(false)}
        >
          Open False
        </button>
        {typedProps.actions.map((action, idx) => (
          <button
            key={idx}
            data-testid={`menu-action-${idx}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  },
}));

const mockPositions: Position[] = [
  {
    id: '1',
    name: 'Software Engineer',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  { id: '2', name: 'Product Manager', created_at: '2026-01-01T00:00:00.000Z' },
];

describe('PositionsTable', () => {
  const mockOnSort = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders data table correctly, handles sorting, row rendering, and action menus', () => {
    render(
      <PositionsTable
        positions={mockPositions}
        sortBy="name"
        sortDirection="asc"
        onSort={mockOnSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const tableWrapper = screen.getByTestId('data-table');
    expect(tableWrapper).toHaveAttribute(
      'data-empty-state',
      'No positions found',
    );

    expect(screen.getByText('Software Engineer')).toBeDefined();
    expect(screen.getByText('Product Manager')).toBeDefined();

    const dataTableProps = mockDataTable.mock.calls[0][0] as {
      getRowKey: (p: Position) => string;
    };
    expect(dataTableProps.getRowKey).toBeDefined();
    expect(dataTableProps.getRowKey(mockPositions[0])).toBe('1');

    fireEvent.click(screen.getByTestId('sort-btn'));
    expect(mockOnSort).toHaveBeenCalledWith('name');

    const menus = screen.getAllByTestId('row-actions-menu');
    expect(menus).toHaveLength(2);
    expect(menus[0]).toHaveAttribute('data-open', 'false');
    expect(menus[0]).toHaveAttribute(
      'data-arialabel',
      'Actions for Software Engineer',
    );

    fireEvent.click(screen.getAllByTestId('menu-open-true')[0]);
    expect(menus[0]).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getAllByTestId('menu-open-false')[0]);
    expect(menus[0]).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getAllByTestId('menu-toggle')[0]);
    expect(menus[0]).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getAllByTestId('menu-action-0')[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockPositions[0]);

    fireEvent.click(screen.getAllByTestId('menu-action-1')[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(mockPositions[0]);
  });
});
