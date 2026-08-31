import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UsersContent } from './UsersContent';

const mockHandleRefresh = vi.fn().mockResolvedValue(undefined);
const mockRefetchQueries = vi
  .fn()
  .mockRejectedValue(new Error('Refetch failed'));
const mockSetSearch = vi.fn();
const mockHandleSort = vi.fn();
const mockSetCurrentPage = vi.fn();
const mockSetPageSize = vi.fn();

const mockUseUsersReturn = {
  paginatedItems: [
    {
      id: '1',
      email: 'john@example.com',
      department: { name: 'Engineering' },
      position: { name: 'Developer' },
      profile: {
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'https://example.com/avatar.jpg',
      },
    },
    {
      id: '2',
      email: 'empty@example.com',
      department: null,
      position: undefined,
      profile: {
        first_name: null,
        last_name: undefined,
        avatar: null,
      },
    },
  ],
  loading: false,
  error: false,
  search: '',
  setSearch: mockSetSearch,
  sortBy: 'firstName' as const,
  sortDirection: 'asc' as const,
  handleSort: mockHandleSort,
  currentPage: 1,
  totalPages: 3,
  pageSize: 10,
  setCurrentPage: mockSetCurrentPage,
  setPageSize: mockSetPageSize,
  handleRefresh: mockHandleRefresh,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'users.loadError': 'Failed to load users',
        'users.create.button': 'Create User',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({
    refetchQueries: mockRefetchQueries,
  }),
}));

vi.mock('@/features/users/hooks/useUsers', () => ({
  useUsers: () => mockUseUsersReturn,
}));

vi.mock('@/components/common/ContentLayout', () => ({
  ContentLayout: ({
    isLoading,
    hasError,
    errorMessage,
    onRetry,
    search,
    onSearchChange,
    actionTrigger,
    pagination,
    children,
  }: {
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    onRetry: () => Promise<void>;
    search: string;
    onSearchChange: (val: string) => void;
    actionTrigger?: React.ReactNode;
    pagination: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      onPageChange: (page: number) => void;
      onPageSizeChange: (size: number) => void;
    };
    children: React.ReactNode;
  }) => (
    <div data-testid="content-layout">
      {isLoading && <div data-testid="loading-state">Loading...</div>}
      {hasError && <div data-testid="error-state">{errorMessage}</div>}
      {onRetry && (
        <button data-testid="retry-btn" onClick={() => void onRetry()}>
          Retry
        </button>
      )}
      <input
        data-testid="search-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div data-testid="action-trigger">{actionTrigger}</div>
      <div data-testid="pagination">
        <span data-testid="page">{pagination.currentPage}</span>
        <button
          data-testid="next-page"
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
        >
          Next Page
        </button>
        <button
          data-testid="change-page-size"
          onClick={() => pagination.onPageSizeChange(20)}
        >
          Change Size
        </button>
      </div>
      <div data-testid="content-children">{children}</div>
    </div>
  ),
}));

vi.mock('@/features/users/components/UsersTable', () => ({
  UsersTable: ({
    users,
    isAdmin,
    onRefresh,
  }: {
    users: Array<{ id: string; firstName: string }>;
    isAdmin: boolean;
    onRefresh: () => Promise<void>;
  }) => (
    <div data-testid="users-table" data-is-admin={String(isAdmin)}>
      {users.map((u) => (
        <div key={u.id} data-testid={`table-user-${u.id}`}>
          {u.firstName}
        </div>
      ))}
      <button data-testid="table-refresh-btn" onClick={() => void onRefresh()}>
        Table Refresh
      </button>
    </div>
  ),
}));

vi.mock('./modals/CreateUserModal', () => ({
  CreateUserModal: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="create-user-modal">
      <button data-testid="trigger-create-success" onClick={onSuccess}>
        Trigger Create Success
      </button>
    </div>
  ),
}));

describe('UsersContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render content layout and users table correctly for admin', () => {
    render(<UsersContent isAdmin={true} />);

    expect(screen.getByTestId('content-layout')).toBeDefined();
    expect(
      screen.getByTestId('users-table').getAttribute('data-is-admin'),
    ).toBe('true');
    expect(screen.getByTestId('table-user-1').textContent).toBe('John');
    expect(screen.getByTestId('create-user-modal')).toBeDefined();
  });

  it('should hide create modal trigger for non-admins', () => {
    render(<UsersContent isAdmin={false} />);

    expect(
      screen.getByTestId('users-table').getAttribute('data-is-admin'),
    ).toBe('false');
    expect(screen.queryByTestId('create-user-modal')).toBeNull();
  });

  it('should handle search input change', () => {
    render(<UsersContent isAdmin={true} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(mockSetSearch).toHaveBeenCalledWith('Jane');
  });

  it('should handle pagination changes', () => {
    render(<UsersContent isAdmin={true} />);

    fireEvent.click(screen.getByTestId('next-page'));
    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByTestId('change-page-size'));
    expect(mockSetPageSize).toHaveBeenCalledWith(20);
  });

  it('should handle retry action correctly calling refresh and catching refetchQueries error', async () => {
    render(<UsersContent isAdmin={true} />);

    fireEvent.click(screen.getByTestId('retry-btn'));

    expect(mockHandleRefresh).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockRefetchQueries).toHaveBeenCalledWith({ include: ['Me'] });
    });
  });

  it('should handle table onRefresh callback correctly', async () => {
    render(<UsersContent isAdmin={true} />);

    fireEvent.click(screen.getByTestId('table-refresh-btn'));

    await waitFor(() => {
      expect(mockHandleRefresh).toHaveBeenCalled();
    });
  });

  it('should handle create user success callback by refreshing users', () => {
    render(<UsersContent isAdmin={true} />);

    fireEvent.click(screen.getByTestId('trigger-create-success'));
    expect(mockHandleRefresh).toHaveBeenCalled();
  });
});
