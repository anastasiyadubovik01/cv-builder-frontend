import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminSkillsContent } from './AdminSkillsContent';
import React from 'react';

const mockHandleRefresh = vi.fn().mockResolvedValue(undefined);
const mockSetSearch = vi.fn();
const mockHandleSort = vi.fn();
const mockSetCurrentPage = vi.fn();
const mockSetPageSize = vi.fn();
const mockHandleRetry = vi.fn();

const mockUseAdminSkillsReturn = {
  paginatedItems: [
    {
      id: '1',
      name: 'Python',
      category: { id: '1', name: 'Backend' },
    },
  ],
  allItems: [
    {
      id: '1',
      name: 'Python',
      category: { id: '1', name: 'Backend' },
    },
  ],
  search: '',
  setSearch: mockSetSearch,
  sortBy: 'name',
  sortDirection: 'asc' as const,
  handleSort: mockHandleSort,
  currentPage: 1,
  totalPages: 3,
  pageSize: 10,
  setCurrentPage: mockSetCurrentPage,
  setPageSize: mockSetPageSize,
  handleRefresh: mockHandleRefresh,
  categoryTypes: {},
  selectableCategories: [{ id: '1', name: 'Backend' }],
  isLoading: false,
  hasError: false,
  handleRetry: mockHandleRetry,
};

vi.mock('@/features/skills/hooks/useAdminSkills', () => ({
  useAdminSkills: () => mockUseAdminSkillsReturn,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'skills.admin.loadError': 'Failed to load skills',
        'skills.admin.create': 'Create Skill',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('@/components/common/ContentLayout', () => ({
  ContentLayout: ({
    children,
    isLoading,
    hasError,
    errorMessage,
    onRetry,
    search,
    onSearchChange,
    actionTrigger,
    pagination,
  }: {
    children: React.ReactNode;
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
  }) => (
    <div
      data-testid="content-layout"
      data-loading={isLoading}
      data-error={hasError}
    >
      {hasError && <div data-testid="error-message">{errorMessage}</div>}
      {hasError && (
        <button data-testid="retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
      <input
        data-testid="search-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div data-testid="action-trigger">{actionTrigger}</div>
      <div data-testid="main-content">{children}</div>
      <div data-testid="pagination">
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
    </div>
  ),
}));

vi.mock('@/features/skills/components/SkillsTable', () => ({
  SkillsTable: ({
    onEdit,
    onDelete,
  }: {
    onEdit: (skill: unknown) => void;
    onDelete: (skill: unknown) => void;
  }) => (
    <div data-testid="skills-table">
      <button
        data-testid="trigger-edit"
        onClick={() =>
          onEdit({
            id: '1',
            name: 'Python',
            category: { id: '1', name: 'Backend' },
          })
        }
      >
        Edit Skill
      </button>
      <button
        data-testid="trigger-delete"
        onClick={() =>
          onDelete({
            id: '1',
            name: 'Python',
            category: { id: '1', name: 'Backend' },
          })
        }
      >
        Delete Skill
      </button>
    </div>
  ),
}));

vi.mock('@/features/skills/components/modals/CreateSkillAdminModal', () => ({
  CreateSkillAdminModal: ({
    trigger,
    onSuccess,
  }: {
    trigger: React.ReactNode;
    onSuccess: () => void;
  }) => (
    <div data-testid="create-skill-modal">
      {trigger}
      <button data-testid="mock-create-success" onClick={onSuccess}>
        Create Success
      </button>
    </div>
  ),
}));

vi.mock('@/features/skills/components/modals/UpdateSkillAdminModal', () => ({
  UpdateSkillAdminModal: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => Promise<void>;
  }) =>
    open ? (
      <div data-testid="update-skill-modal">
        <button data-testid="close-update" onClick={() => onOpenChange(false)}>
          Close Update
        </button>
        <button data-testid="direct-close" onClick={() => onOpenChange(true)}>
          Direct Open
        </button>
        <button data-testid="confirm-update" onClick={() => void onSuccess()}>
          Confirm Update
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/skills/components/modals/DeleteSkillModal', () => ({
  DeleteSkillModal: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => Promise<void>;
  }) =>
    open ? (
      <div data-testid="delete-skill-modal">
        <button data-testid="close-delete" onClick={() => onOpenChange(false)}>
          Close Delete
        </button>
        <button data-testid="confirm-delete" onClick={() => void onSuccess()}>
          Confirm Delete
        </button>
      </div>
    ) : null,
}));

describe('AdminSkillsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and integrates pagination and search handlers', () => {
    render(<AdminSkillsContent />);

    expect(screen.getByTestId('content-layout')).toBeDefined();
    expect(screen.getByTestId('skills-table')).toBeDefined();
    expect(screen.getByTestId('create-skill-modal')).toBeDefined();

    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'Java' },
    });
    expect(mockSetSearch).toHaveBeenCalledWith('Java');

    fireEvent.click(screen.getByTestId('next-page'));
    expect(mockSetCurrentPage).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByTestId('change-page-size'));
    expect(mockSetPageSize).toHaveBeenCalledWith(20);
  });

  it('handles loading and error states properly', () => {
    mockUseAdminSkillsReturn.hasError = true;
    mockUseAdminSkillsReturn.isLoading = true;

    render(<AdminSkillsContent />);

    expect(screen.getByTestId('content-layout')).toHaveAttribute(
      'data-loading',
      'true',
    );
    expect(screen.getByTestId('content-layout')).toHaveAttribute(
      'data-error',
      'true',
    );
    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Failed to load skills',
    );

    fireEvent.click(screen.getByTestId('retry-button'));
    expect(mockHandleRetry).toHaveBeenCalled();

    mockUseAdminSkillsReturn.hasError = false;
    mockUseAdminSkillsReturn.isLoading = false;
  });

  it('manages editing modal opening, closing, and successful updates', async () => {
    render(<AdminSkillsContent />);

    fireEvent.click(screen.getByTestId('trigger-edit'));
    expect(screen.getByTestId('update-skill-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('confirm-update'));
    await waitFor(() => {
      expect(mockHandleRefresh).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('trigger-edit'));
    fireEvent.click(screen.getByTestId('close-update'));
    expect(screen.queryByTestId('update-skill-modal')).toBeNull();

    fireEvent.click(screen.getByTestId('trigger-edit'));
    expect(screen.getByTestId('update-skill-modal')).toBeDefined();
    fireEvent.click(screen.getByTestId('direct-close'));
  });

  it('manages deletion modal opening, closing, and successful deletions', async () => {
    render(<AdminSkillsContent />);

    fireEvent.click(screen.getByTestId('trigger-delete'));
    expect(screen.getByTestId('delete-skill-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('confirm-delete'));
    await waitFor(() => {
      expect(mockHandleRefresh).toHaveBeenCalled();
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    });

    fireEvent.click(screen.getByTestId('trigger-delete'));
    fireEvent.click(screen.getByTestId('close-delete'));
    expect(screen.queryByTestId('delete-skill-modal')).toBeNull();
  });

  it('triggers creation success refresh flow', async () => {
    render(<AdminSkillsContent />);

    fireEvent.click(screen.getByTestId('mock-create-success'));
    expect(mockHandleRefresh).toHaveBeenCalled();
  });
});
