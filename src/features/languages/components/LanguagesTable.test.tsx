import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguagesTable } from './LanguagesTable';
import type { ApiLanguage } from '@/api/languages';

const mockHandleSort = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'languages.admin.name': 'Name',
        'languages.admin.iso': 'ISO',
        'languages.admin.nativeName': 'Native Name',
        'languages.admin.empty': 'No languages found',
        'dialogs.actions.edit': 'Edit',
        'dialogs.actions.delete': 'Delete',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/components/ui/data-table', () => ({
  DataTable: ({
    data,
    columns,
    emptyState,
    getRowKey,
    onSort,
    sortBy,
    sortDirection,
  }: {
    data: ApiLanguage[];
    columns: Array<{
      id: string;
      header: string;
      render: (item: ApiLanguage) => React.ReactNode;
    }>;
    emptyState: string;
    getRowKey: (item: ApiLanguage) => string;
    onSort: (column: string) => void;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  }) => (
    <div
      data-testid="data-table"
      data-sort-by={sortBy}
      data-sort-direction={sortDirection}
    >
      <button data-testid="sort-trigger" onClick={() => onSort('name')}>
        Sort
      </button>
      {data.length === 0 ? (
        <div data-testid="empty-state">{emptyState}</div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.id}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const rowKey = getRowKey(row);
              return (
                <tr key={rowKey} data-testid={`row-${rowKey}`}>
                  {columns.map((col) => (
                    <td key={col.id} data-testid={`cell-${col.id}-${rowKey}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  ),
}));

vi.mock('@/components/ui/row-actions-menu', () => ({
  RowActionsMenu: ({
    open,
    onOpenChange,
    ariaLabel,
    actions,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ariaLabel: string;
    actions: Array<{ label: string; onClick: () => void }>;
  }) => (
    <div data-testid="row-actions-menu" data-open={open} aria-label={ariaLabel}>
      <button
        type="button"
        data-testid={`toggle-menu-${ariaLabel}`}
        onClick={() => onOpenChange(!open)}
      >
        Toggle
      </button>
      {actions.map((act) => (
        <button
          key={act.label}
          type="button"
          data-testid={`action-${act.label}`}
          onClick={act.onClick}
        >
          {act.label}
        </button>
      ))}
    </div>
  ),
}));

describe('LanguagesTable', () => {
  const mockLanguages: ApiLanguage[] = [
    {
      id: '1',
      name: 'English',
      iso2: 'en',
      native_name: 'English',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Russian',
      iso2: 'ru',
      native_name: null,
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render table columns and language data correctly', () => {
    render(
      <LanguagesTable
        languages={mockLanguages}
        sortBy="name"
        sortDirection="asc"
        onSort={mockHandleSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByTestId('data-table')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('ISO')).toBeDefined();
    expect(screen.getByText('Native Name')).toBeDefined();

    expect(screen.getByTestId('cell-name-1').textContent).toBe('English');
    expect(screen.getByTestId('cell-iso2-1').textContent).toBe('en');
    expect(screen.getByTestId('cell-nativeName-1').textContent).toBe('English');

    expect(screen.getByTestId('cell-name-2').textContent).toBe('Russian');
    expect(screen.getByTestId('cell-iso2-2').textContent).toBe('ru');
    expect(screen.getByTestId('cell-nativeName-2').textContent).toBe('');
  });

  it('should render empty state when no languages are provided', () => {
    render(
      <LanguagesTable
        languages={[]}
        sortBy="name"
        sortDirection="asc"
        onSort={mockHandleSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByTestId('empty-state').textContent).toBe(
      'No languages found',
    );
  });

  it('should trigger onEdit and onDelete when corresponding row actions are invoked', () => {
    render(
      <LanguagesTable
        languages={mockLanguages}
        sortBy="name"
        sortDirection="asc"
        onSort={mockHandleSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const editButtons = screen.getAllByTestId('action-Edit');
    const deleteButtons = screen.getAllByTestId('action-Delete');

    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(editButtons[0] as HTMLElement);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockLanguages[0]);

    fireEvent.click(deleteButtons[1] as HTMLElement);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockLanguages[1]);
  });

  it('should handle row actions menu open and close state changes correctly', () => {
    render(
      <LanguagesTable
        languages={mockLanguages}
        sortBy="name"
        sortDirection="asc"
        onSort={mockHandleSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const toggleButtons = screen.getAllByTestId(
      'toggle-menu-Actions for English',
    );
    const menu1 = screen.getAllByTestId('row-actions-menu')[0];

    expect(menu1?.getAttribute('data-open')).toBe('false');

    fireEvent.click(toggleButtons[0] as HTMLElement);
    expect(menu1?.getAttribute('data-open')).toBe('true');

    fireEvent.click(toggleButtons[0] as HTMLElement);
    expect(menu1?.getAttribute('data-open')).toBe('false');
  });
});
