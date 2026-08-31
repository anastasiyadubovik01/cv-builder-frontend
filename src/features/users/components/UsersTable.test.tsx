import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { UsersTable } from './UsersTable';
import type { User } from '@/features/users/types';

const mockRefresh = vi.fn().mockResolvedValue(undefined);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'users.table.firstName': 'First Name',
        'users.table.lastName': 'Last Name',
        'users.table.email': 'Email',
        'users.table.department': 'Department',
        'users.table.position': 'Position',
        'users.noResults': 'No users found',
        'dialogs.actions.view': 'View',
        'dialogs.actions.update': 'Update',
        'dialogs.actions.delete': 'Delete',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    href: string;
    'aria-label'?: string;
  }) => (
    <a href={href} aria-label={ariaLabel} data-testid="user-link">
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/data-table', () => ({
  DataTable: ({
    data,
    columns,
    emptyState,
    onSort,
  }: {
    data: User[];
    columns: Array<{
      id: string;
      header: string;
      render: (user: User) => React.ReactNode;
    }>;
    emptyState: string;
    onSort: (field: string) => void;
  }) => (
    <div data-testid="data-table">
      {data.length === 0 ? (
        <div data-testid="empty-state">{emptyState}</div>
      ) : (
        data.map((user) => (
          <div key={user.id} data-testid={`user-row-${user.id}`}>
            {columns.map((col) => (
              <div key={col.id} data-testid={`col-${col.id}`}>
                {col.render(user)}
              </div>
            ))}
          </div>
        ))
      )}
      <button data-testid="sort-btn" onClick={() => onSort('firstName')}>
        Sort
      </button>
    </div>
  ),
}));

vi.mock('@/components/ui/row-actions-menu', () => ({
  RowActionsMenu: ({
    open,
    onOpenChange,
    actions,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actions: Array<{ label: string; href?: string; onClick?: () => void }>;
  }) => (
    <div data-testid="row-actions-menu" data-open={String(open)}>
      <button data-testid="toggle-menu" onClick={() => onOpenChange(!open)}>
        Toggle Menu
      </button>
      {actions.map((action, idx) => (
        <button
          key={idx}
          data-testid={`action-${action.label}`}
          onClick={action.onClick}
        >
          {action.label}
          {action.href && <a href={action.href}>Link</a>}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/features/users/components/modals/UpdateUserModal', () => ({
  UpdateUserModal: ({
    userId,
    open,
    onOpenChange,
    onSuccess,
  }: {
    userId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
  }) => (
    <div
      data-testid="update-user-modal"
      data-user-id={userId}
      data-open={String(open)}
    >
      <button data-testid="close-update" onClick={() => onOpenChange(false)}>
        Close
      </button>
      <button data-testid="success-update" onClick={() => void onSuccess()}>
        Success
      </button>
    </div>
  ),
}));

vi.mock('@/features/users/components/modals/DeleteUserModal', () => ({
  DeleteUserModal: ({
    userId,
    name,
    open,
    onOpenChange,
    onSuccess,
  }: {
    userId: string;
    name: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
  }) => (
    <div
      data-testid="delete-user-modal"
      data-user-id={userId}
      data-name={name}
      data-open={String(open)}
    >
      <button data-testid="close-delete" onClick={() => onOpenChange(false)}>
        Close
      </button>
      <button data-testid="success-delete" onClick={() => void onSuccess()}>
        Success
      </button>
    </div>
  ),
}));

describe('UsersTable', () => {
  const sampleUsers: User[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      department: 'Engineering',
      position: 'Developer',
      avatar: 'https://example.com/avatar.jpg',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      department: 'HR',
      position: 'Manager',
    },
  ];

  const mockOnSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render users data and handle empty state correctly', () => {
    const { rerender } = render(
      <UsersTable
        users={sampleUsers}
        sortBy="firstName"
        sortDirection="asc"
        onSort={mockOnSort}
        isAdmin={true}
        onRefresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('data-table')).toBeDefined();
    expect(screen.getByTestId('user-row-1')).toBeDefined();
    expect(screen.getByTestId('user-row-2')).toBeDefined();

    const avatarFallback = screen.getByText('J');
    expect(avatarFallback).toBeDefined();

    rerender(
      <UsersTable
        users={[]}
        sortBy="firstName"
        sortDirection="asc"
        onSort={mockOnSort}
        isAdmin={true}
        onRefresh={mockRefresh}
      />,
    );

    expect(screen.getByTestId('empty-state').textContent).toBe(
      'No users found',
    );
  });

  it('should render link for non-admin users', () => {
    render(
      <UsersTable
        users={sampleUsers}
        sortBy="firstName"
        sortDirection="asc"
        onSort={mockOnSort}
        isAdmin={false}
        onRefresh={mockRefresh}
      />,
    );

    const row1 = screen.getByTestId('user-row-1');
    const link = within(row1).getByTestId('user-link');
    expect(link.getAttribute('href')).toBe('/users/1');
    expect(link.getAttribute('aria-label')).toBe('Open John Doe');
  });

  it('should open row actions menu and handle update and delete modal interactions for admin', async () => {
    render(
      <UsersTable
        users={sampleUsers}
        sortBy="firstName"
        sortDirection="asc"
        onSort={mockOnSort}
        isAdmin={true}
        onRefresh={mockRefresh}
      />,
    );

    const row1 = screen.getByTestId('user-row-1');
    const toggleMenuBtn = within(row1).getAllByTestId('toggle-menu')[0]!;
    fireEvent.click(toggleMenuBtn);

    const menu = within(row1).getByTestId('row-actions-menu');
    expect(menu.getAttribute('data-open')).toBe('true');

    const updateBtn = within(row1).getByTestId('action-Update');
    fireEvent.click(updateBtn);

    expect(
      screen.getByTestId('update-user-modal').getAttribute('data-user-id'),
    ).toBe('1');

    fireEvent.click(screen.getByTestId('close-update'));
    expect(screen.queryByTestId('update-user-modal')).toBeNull();

    fireEvent.click(toggleMenuBtn);
    fireEvent.click(updateBtn);
    fireEvent.click(screen.getByTestId('success-update'));
    expect(mockRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(toggleMenuBtn);
    const deleteBtn = within(row1).getByTestId('action-Delete');
    fireEvent.click(deleteBtn);

    const deleteModal = screen.getByTestId('delete-user-modal');
    expect(deleteModal.getAttribute('data-user-id')).toBe('1');
    expect(deleteModal.getAttribute('data-name')).toBe('John Doe');

    fireEvent.click(screen.getByTestId('success-delete'));
    expect(mockRefresh).toHaveBeenCalledTimes(2);

    fireEvent.click(toggleMenuBtn);
    fireEvent.click(deleteBtn);
    fireEvent.click(screen.getByTestId('close-delete'));
    expect(screen.queryByTestId('delete-user-modal')).toBeNull();
  });

  it('should trigger sorting callback', () => {
    render(
      <UsersTable
        users={sampleUsers}
        sortBy="firstName"
        sortDirection="asc"
        onSort={mockOnSort}
        isAdmin={true}
        onRefresh={mockRefresh}
      />,
    );

    fireEvent.click(screen.getByTestId('sort-btn'));
    expect(mockOnSort).toHaveBeenCalledWith('firstName');
  });
});
