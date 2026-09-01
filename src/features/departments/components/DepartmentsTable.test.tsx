import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DepartmentsTable } from './DepartmentsTable';
import type { ApiDepartment } from '@/api/departments';
import React from 'react';

const mockDataTable = vi.fn();
const mockRowActionsMenu = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'departments.name': 'Name',
        'dialogs.actions.edit': 'Edit',
        'dialogs.actions.delete': 'Delete',
        'departments.empty': 'No departments found',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('@/components/ui/data-table', () => ({
  DataTable: (props: unknown) => {
    mockDataTable(props);
    const typedProps = props as {
      data: ApiDepartment[];
      columns: Array<{
        id: string;
        header: string;
        render: (dept: ApiDepartment) => React.ReactNode;
      }>;
      emptyState: string;
      sortBy: string;
      sortDirection: string;
      onSort: (field: string) => void;
      getRowKey: (department: ApiDepartment) => string;
    };
    return (
      <div data-testid="data-table" data-empty-state={typedProps.emptyState}>
        {typedProps.data.map((dept) => {
          const rowKey = typedProps.getRowKey
            ? typedProps.getRowKey(dept)
            : dept.id;
          return (
            <div key={rowKey} data-testid={`table-row-${rowKey}`}>
              {typedProps.columns.map((col) => (
                <div key={col.id} data-testid={`col-${col.id}`}>
                  {col.render(dept)}
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

const mockDepartments: ApiDepartment[] = [
  { id: '1', name: 'Engineering', created_at: '2026-01-01T00:00:00.000Z' },
  { id: '2', name: 'Sales', created_at: '2026-01-01T00:00:00.000Z' },
];

describe('DepartmentsTable', () => {
  const mockOnSort = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders data table correctly, handles sorting, row rendering, getRowKey, and action menus', () => {
    render(
      <DepartmentsTable
        departments={mockDepartments}
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
      'No departments found',
    );

    expect(screen.getByText('Engineering')).toBeDefined();
    expect(screen.getByText('Sales')).toBeDefined();

    const dataTableProps = mockDataTable.mock.calls[0][0] as {
      getRowKey: (d: ApiDepartment) => string;
    };
    expect(dataTableProps.getRowKey).toBeDefined();
    expect(dataTableProps.getRowKey(mockDepartments[0])).toBe('1');

    fireEvent.click(screen.getByTestId('sort-btn'));
    expect(mockOnSort).toHaveBeenCalledWith('name');

    const menus = screen.getAllByTestId('row-actions-menu');
    expect(menus).toHaveLength(2);
    expect(menus[0]).toHaveAttribute('data-open', 'false');
    expect(menus[0]).toHaveAttribute(
      'data-arialabel',
      'Actions for Engineering',
    );

    fireEvent.click(screen.getAllByTestId('menu-toggle')[0]);
    expect(menus[0]).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getAllByTestId('menu-toggle')[0]);
    expect(menus[0]).toHaveAttribute('data-open', 'false');

    fireEvent.click(screen.getAllByTestId('menu-toggle')[0]);
    expect(menus[0]).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getAllByTestId('menu-action-0')[0]);
    expect(mockOnEdit).toHaveBeenCalledWith(mockDepartments[0]);

    fireEvent.click(screen.getAllByTestId('menu-action-1')[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(mockDepartments[0]);
  });
});
