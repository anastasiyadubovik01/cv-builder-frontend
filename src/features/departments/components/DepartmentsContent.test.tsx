import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DepartmentsContent } from './DepartmentsContent';
import type { ApiDepartment } from '@/api/departments';
import React from 'react';

const mockUseDepartments = vi.fn();

vi.mock('@/features/departments/hooks/useDepartments', () => ({
  useDepartments: () => mockUseDepartments(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'departments.loadError': 'Failed to load departments',
        'departments.create': 'CREATE DEPARTMENT',
      };
      return translations[key] || fallback || key;
    },
  }),
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
    onRetry: () => void;
    search: string;
    onSearchChange: (val: string) => void;
    actionTrigger: React.ReactNode;
    pagination: {
      currentPage: number;
      totalPages: number;
      pageSize: number;
      onPageChange: (page: number) => void;
      onPageSizeChange: (size: number) => void;
    };
    children: React.ReactNode;
  }) => (
    <div
      data-testid="content-layout"
      data-loading={String(isLoading)}
      data-has-error={String(hasError)}
      data-error-message={errorMessage}
      data-search={search}
    >
      <button data-testid="retry-btn" onClick={onRetry}>
        Retry
      </button>
      <button
        data-testid="search-change-btn"
        onClick={() => onSearchChange('Engineering')}
      >
        Change Search
      </button>
      <div data-testid="action-trigger-container">{actionTrigger}</div>
      <div data-testid="pagination-info">
        Page {pagination.currentPage} of {pagination.totalPages}, Size{' '}
        {pagination.pageSize}
      </div>
      <button
        data-testid="page-change-btn"
        onClick={() => pagination.onPageChange(2)}
      >
        Next Page
      </button>
      <button
        data-testid="pagesize-change-btn"
        onClick={() => pagination.onPageSizeChange(20)}
      >
        Change Page Size
      </button>
      <div data-testid="layout-children">{children}</div>
    </div>
  ),
}));

vi.mock('./DepartmentsTable', () => ({
  DepartmentsTable: ({
    departments,
    onEdit,
    onDelete,
  }: {
    departments: ApiDepartment[];
    onEdit: (d: ApiDepartment) => void;
    onDelete: (d: ApiDepartment) => void;
  }) => (
    <div data-testid="departments-table" data-count={departments.length}>
      {departments.map((d) => (
        <div key={d.id} data-testid={`department-row-${d.id}`}>
          <span>{d.name}</span>
          <button data-testid={`edit-btn-${d.id}`} onClick={() => onEdit(d)}>
            Edit
          </button>
          <button
            data-testid={`delete-btn-${d.id}`}
            onClick={() => onDelete(d)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./modals/CreateDepartmentModal', () => ({
  CreateDepartmentModal: ({
    trigger,
    onSuccess,
  }: {
    trigger: React.ReactNode;
    onSuccess: () => void;
  }) => (
    <div data-testid="create-department-modal">
      {trigger}
      <button data-testid="trigger-create-success" onClick={onSuccess}>
        Trigger Create Success
      </button>
    </div>
  ),
}));

vi.mock('./modals/UpdateDepartmentModal', () => ({
  UpdateDepartmentModal: ({
    department,
    open,
    onOpenChange,
    onSuccess,
  }: {
    department: ApiDepartment;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => Promise<void>;
  }) => (
    <div
      data-testid="update-department-modal"
      data-department-id={department.id}
      data-open={String(open)}
    >
      <button
        data-testid="close-update-modal"
        onClick={() => onOpenChange(false)}
      >
        Close Update
      </button>
      <button
        data-testid="trigger-update-open-true"
        onClick={() => onOpenChange(true)}
      >
        Trigger Update Open True
      </button>
      <button
        data-testid="trigger-update-success"
        onClick={() => void onSuccess()}
      >
        Trigger Update Success
      </button>
    </div>
  ),
}));

vi.mock('./modals/DeleteDepartmentModal', () => ({
  DeleteDepartmentModal: ({
    departmentId,
    open,
    onOpenChange,
    onSuccess,
  }: {
    departmentId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => Promise<void>;
  }) => (
    <div
      data-testid="delete-department-modal"
      data-department-id={departmentId}
      data-open={String(open)}
    >
      <button
        data-testid="close-delete-modal"
        onClick={() => onOpenChange(false)}
      >
        Close Delete
      </button>
      <button
        data-testid="trigger-delete-open-true"
        onClick={() => onOpenChange(true)}
      >
        Trigger Delete Open True
      </button>
      <button
        data-testid="trigger-delete-success"
        onClick={() => void onSuccess()}
      >
        Trigger Delete Success
      </button>
    </div>
  ),
}));

const mockDepartment: ApiDepartment = {
  id: '1',
  name: 'Sales',
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('DepartmentsContent', () => {
  const mockSetSearch = vi.fn();
  const mockSetCurrentPage = vi.fn();
  const mockSetPageSize = vi.fn();
  const mockHandleRefresh = vi.fn().mockResolvedValue(undefined);
  const mockHandleSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDepartments.mockReturnValue({
      paginatedItems: [mockDepartment],
      allItems: [mockDepartment],
      loading: false,
      error: false,
      search: '',
      setSearch: mockSetSearch,
      sortBy: 'name',
      sortDirection: 'asc',
      handleSort: mockHandleSort,
      currentPage: 1,
      totalPages: 3,
      pageSize: 10,
      setCurrentPage: mockSetCurrentPage,
      setPageSize: mockSetPageSize,
      handleRefresh: mockHandleRefresh,
    });
  });

  it('renders content layout, table, and actions correctly, and propagates hook handlers', () => {
    render(<DepartmentsContent />);

    const layout = screen.getByTestId('content-layout');
    expect(layout).toHaveAttribute('data-loading', 'false');
    expect(layout).toHaveAttribute('data-has-error', 'false');
    expect(layout).toHaveAttribute(
      'data-error-message',
      'Failed to load departments',
    );

    expect(screen.getByTestId('departments-table')).toHaveAttribute(
      'data-count',
      '1',
    );
    expect(screen.getByTestId('department-row-1')).toBeDefined();

    fireEvent.click(screen.getByTestId('search-change-btn'));
    expect(mockSetSearch).toHaveBeenCalledWith('Engineering');

    fireEvent.click(screen.getByTestId('retry-btn'));
    expect(mockHandleRefresh).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('page-change-btn'));
    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByTestId('pagesize-change-btn'));
    expect(mockSetPageSize).toHaveBeenCalledWith(20);
  });

  it('opens update and delete modals when requested and closes them appropriately', () => {
    render(<DepartmentsContent />);

    expect(screen.queryByTestId('update-department-modal')).toBeNull();
    expect(screen.queryByTestId('delete-department-modal')).toBeNull();

    fireEvent.click(screen.getByTestId('edit-btn-1'));
    expect(screen.getByTestId('update-department-modal')).toHaveAttribute(
      'data-department-id',
      '1',
    );
    expect(screen.getByTestId('update-department-modal')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('trigger-update-open-true'));
    expect(screen.getByTestId('update-department-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('close-update-modal'));
    expect(screen.queryByTestId('update-department-modal')).toBeNull();

    fireEvent.click(screen.getByTestId('delete-btn-1'));
    expect(screen.getByTestId('delete-department-modal')).toHaveAttribute(
      'data-department-id',
      '1',
    );
    expect(screen.getByTestId('delete-department-modal')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('trigger-delete-open-true'));
    expect(screen.getByTestId('delete-department-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('close-delete-modal'));
    expect(screen.queryByTestId('delete-department-modal')).toBeNull();
  });

  it('handles successful creation, update, and deletion callbacks by calling handleRefresh and closing modals', async () => {
    render(<DepartmentsContent />);

    fireEvent.click(screen.getByTestId('trigger-create-success'));
    expect(mockHandleRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('edit-btn-1'));
    expect(screen.getByTestId('update-department-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('trigger-update-success'));
    await waitFor(() => {
      expect(mockHandleRefresh).toHaveBeenCalledTimes(2);
      expect(screen.queryByTestId('update-department-modal')).toBeNull();
    });

    fireEvent.click(screen.getByTestId('delete-btn-1'));
    expect(screen.getByTestId('delete-department-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('trigger-delete-success'));
    await waitFor(() => {
      expect(mockHandleRefresh).toHaveBeenCalledTimes(3);
      expect(screen.queryByTestId('delete-department-modal')).toBeNull();
    });
  });
});
