import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillsTable } from './SkillsTable';
import type { ApiSkill } from '@/api/skills';
import React from 'react';

const mockOnSort = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

const mockSkills: ApiSkill[] = [
  {
    id: '1',
    name: 'JavaScript',
    category: {
      id: '1',
      name: 'Programming',
      order: 1,
      parent: { id: '1', name: 'Languages' },
    },
    category_name: 'Programming',
    category_parent_name: 'Languages',
  },
  {
    id: '2',
    name: 'React',
    category: {
      id: '2',
      name: 'Frontend',
      parent: null,
      order: 2,
    },
    category_name: undefined as unknown as string,
    category_parent_name: 'FallbackParent',
  },
  {
    id: '3',
    name: 'Python',
    category: {
      id: '3',
      name: 'Backend',
      parent: null,
      order: 3,
    },
    category_name: 'BackendCat',
    category_parent_name: undefined as unknown as string,
  },
];

const categoryTypes = {
  '1': 'Languages & Frameworks',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'skills.admin.name': 'Name',
        'skills.admin.type': 'Type',
        'skills.admin.category': 'Category',
        'skills.admin.empty': 'No skills found',
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
    getRowKey,
    sortBy,
    sortDirection,
    onSort,
    emptyState,
  }: {
    data: ApiSkill[];
    columns: Array<{
      id: string;
      header: string;
      render: (item: ApiSkill) => React.ReactNode;
      className?: string;
    }>;
    getRowKey: (item: ApiSkill) => string;
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    emptyState: string;
  }) => (
    <div
      data-testid="data-table"
      data-sortby={sortBy}
      data-direction={sortDirection}
    >
      <button data-testid="sort-trigger" onClick={() => onSort('name')}>
        Sort Name
      </button>
      {data.length === 0 ? (
        <div data-testid="empty-state">{emptyState}</div>
      ) : (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.id} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => {
              const rowKey = getRowKey(item);
              return (
                <tr key={rowKey} data-testid={`row-${rowKey}`}>
                  {columns.map((col) => (
                    <td key={col.id} data-cell={col.id}>
                      {col.render(item)}
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
    <div data-testid={`row-actions-${ariaLabel}`} data-open={open}>
      <button data-testid="toggle-menu" onClick={() => onOpenChange(!open)}>
        Toggle
      </button>
      {open && (
        <div data-testid="menu-dropdown">
          {actions.map((action, idx) => (
            <button
              key={idx}
              data-testid={`action-${action.label}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  ),
}));

describe('SkillsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table columns and rows correctly with all category fallbacks', () => {
    render(
      <SkillsTable
        skills={mockSkills}
        categoryTypes={categoryTypes}
        sortBy="name"
        sortDirection="asc"
        onSort={mockOnSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByTestId('data-table')).toBeDefined();
    expect(screen.getByText('JavaScript')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Python')).toBeDefined();
    expect(screen.getByText('Languages & Frameworks')).toBeDefined();
    expect(screen.getByText('FallbackParent')).toBeDefined();
  });

  it('triggers sorting callback when sort is invoked', () => {
    render(
      <SkillsTable
        skills={mockSkills}
        categoryTypes={categoryTypes}
        sortBy="name"
        sortDirection="asc"
        onSort={mockOnSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('sort-trigger'));
    expect(mockOnSort).toHaveBeenCalledWith('name');
  });

  it('opens row actions menu and triggers edit and delete callbacks', () => {
    render(
      <SkillsTable
        skills={mockSkills}
        categoryTypes={categoryTypes}
        sortBy="name"
        sortDirection="asc"
        onSort={mockOnSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const toggleButtons = screen.getAllByTestId('toggle-menu');
    fireEvent.click(toggleButtons[0]);

    expect(screen.getByTestId('menu-dropdown')).toBeDefined();

    fireEvent.click(screen.getByTestId('action-Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockSkills[0]);

    fireEvent.click(screen.getByTestId('action-Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockSkills[0]);
  });

  it('renders empty state when skills array is empty', () => {
    render(
      <SkillsTable
        skills={[]}
        categoryTypes={categoryTypes}
        sortBy="name"
        sortDirection="asc"
        onSort={mockOnSort}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByTestId('empty-state')).toHaveTextContent(
      'No skills found',
    );
  });
});
