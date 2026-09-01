import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PositionsContent } from './PositionsContent';
import type { Position } from '@/api/positions';
import React from 'react';

const mockUsePositions = vi.fn();

vi.mock('@/features/positions/hooks/usePositions', () => ({
  usePositions: () => mockUsePositions(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'positions.loadError': 'Failed to load positions',
        'positions.create': 'Create position',
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
        onClick={() => onSearchChange('Engineer')}
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

vi.mock('./PositionsTable', () => ({
  PositionsTable: ({
    positions,
    onEdit,
    onDelete,
  }: {
    positions: Position[];
    onEdit: (p: Position) => void;
    onDelete: (p: Position) => void;
  }) => (
    <div data-testid="positions-table" data-count={positions.length}>
      {positions.map((p) => (
        <div key={p.id} data-testid={`position-row-${p.id}`}>
          <span>{p.name}</span>
          <button data-testid={`edit-btn-${p.id}`} onClick={() => onEdit(p)}>
            Edit
          </button>
          <button
            data-testid={`delete-btn-${p.id}`}
            onClick={() => onDelete(p)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./modals/CreatePositionModal', () => ({
  CreatePositionModal: ({
    trigger,
    onSuccess,
  }: {
    trigger: React.ReactNode;
    onSuccess: () => void;
  }) => (
    <div data-testid="create-position-modal">
      {trigger}
      <button data-testid="trigger-create-success" onClick={onSuccess}>
        Trigger Create Success
      </button>
    </div>
  ),
}));

vi.mock('./modals/UpdatePositionModal', () => ({
  UpdatePositionModal: ({
    position,
    open,
    onOpenChange,
    onSuccess,
  }: {
    position: Position;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => Promise<void>;
  }) => (
    <div
      data-testid="update-position-modal"
      data-position-id={position.id}
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

vi.mock('./modals/DeletePositionModal', () => ({
  DeletePositionModal: ({
    positionId,
    open,
    onOpenChange,
    onSuccess,
  }: {
    positionId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => Promise<void>;
  }) => (
    <div
      data-testid="delete-position-modal"
      data-position-id={positionId}
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

const mockPosition: Position = {
  id: 'pos-1',
  name: 'Developer',
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('PositionsContent', () => {
  const mockSetSearch = vi.fn();
  const mockSetCurrentPage = vi.fn();
  const mockSetPageSize = vi.fn();
  const mockHandleRefresh = vi.fn().mockResolvedValue(undefined);
  const mockHandleSort = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePositions.mockReturnValue({
      paginatedItems: [mockPosition],
      allItems: [mockPosition],
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
    render(<PositionsContent />);

    const layout = screen.getByTestId('content-layout');
    expect(layout).toHaveAttribute('data-loading', 'false');
    expect(layout).toHaveAttribute('data-has-error', 'false');
    expect(layout).toHaveAttribute(
      'data-error-message',
      'Failed to load positions',
    );

    expect(screen.getByTestId('positions-table')).toHaveAttribute(
      'data-count',
      '1',
    );
    expect(screen.getByTestId('position-row-pos-1')).toBeDefined();

    fireEvent.click(screen.getByTestId('search-change-btn'));
    expect(mockSetSearch).toHaveBeenCalledWith('Engineer');

    fireEvent.click(screen.getByTestId('retry-btn'));
    expect(mockHandleRefresh).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('page-change-btn'));
    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByTestId('pagesize-change-btn'));
    expect(mockSetPageSize).toHaveBeenCalledWith(20);
  });

  it('opens update and delete modals when requested and closes them appropriately', () => {
    render(<PositionsContent />);

    expect(screen.queryByTestId('update-position-modal')).toBeNull();
    expect(screen.queryByTestId('delete-position-modal')).toBeNull();

    fireEvent.click(screen.getByTestId('edit-btn-pos-1'));
    expect(screen.getByTestId('update-position-modal')).toHaveAttribute(
      'data-position-id',
      'pos-1',
    );
    expect(screen.getByTestId('update-position-modal')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('trigger-update-open-true'));
    expect(screen.getByTestId('update-position-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('close-update-modal'));
    expect(screen.queryByTestId('update-position-modal')).toBeNull();

    fireEvent.click(screen.getByTestId('delete-btn-pos-1'));
    expect(screen.getByTestId('delete-position-modal')).toHaveAttribute(
      'data-position-id',
      'pos-1',
    );
    expect(screen.getByTestId('delete-position-modal')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('trigger-delete-open-true'));
    expect(screen.getByTestId('delete-position-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('close-delete-modal'));
    expect(screen.queryByTestId('delete-position-modal')).toBeNull();
  });

  it('handles successful creation, update, and deletion callbacks by calling handleRefresh and closing modals', async () => {
    render(<PositionsContent />);

    fireEvent.click(screen.getByTestId('trigger-create-success'));
    expect(mockHandleRefresh).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('edit-btn-pos-1'));
    expect(screen.getByTestId('update-position-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('trigger-update-success'));
    await waitFor(() => {
      expect(mockHandleRefresh).toHaveBeenCalledTimes(2);
      expect(screen.queryByTestId('update-position-modal')).toBeNull();
    });

    fireEvent.click(screen.getByTestId('delete-btn-pos-1'));
    expect(screen.getByTestId('delete-position-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('trigger-delete-success'));
    await waitFor(() => {
      expect(mockHandleRefresh).toHaveBeenCalledTimes(3);
      expect(screen.queryByTestId('delete-position-modal')).toBeNull();
    });
  });
});
