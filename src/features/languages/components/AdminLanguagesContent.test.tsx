import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLanguagesContent } from './AdminLanguagesContent';
import type { ApiLanguage } from '@/api/languages';

const mockHandleRefresh = vi.fn().mockResolvedValue(undefined);
const mockSetSearch = vi.fn();
const mockHandleSort = vi.fn();
const mockSetCurrentPage = vi.fn();
const mockSetPageSize = vi.fn();

const mockUseLanguages = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'languages.admin.create': 'Create Language',
        'languages.admin.loadError': 'Failed to load languages',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('@/features/languages/hooks/useLanguages', () => ({
  useLanguages: () => mockUseLanguages(),
}));

vi.mock('@/components/icons/plus-icon', () => ({
  PlusIcon: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="plus-icon" {...props} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    type,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    type?: 'submit' | 'button' | 'reset';
    onClick?: () => void;
    className?: string;
  }) => (
    <button
      type={type}
      onClick={onClick}
      className={className}
      data-testid="create-language-button"
    >
      {children}
    </button>
  ),
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
  }: {
    children: React.ReactNode;
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    onRetry: () => void;
    search: string;
    onSearchChange: (value: string) => void;
    actionTrigger: React.ReactNode;
  }) => (
    <div
      data-testid="content-layout"
      data-is-loading={isLoading}
      data-has-error={hasError}
      data-error-message={errorMessage}
      data-search={search}
    >
      <button data-testid="retry-button" onClick={onRetry}>
        Retry
      </button>
      <input
        data-testid="search-input"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div data-testid="action-trigger-container">{actionTrigger}</div>
      <div data-testid="content-children">{children}</div>
    </div>
  ),
}));

vi.mock('./LanguagesTable', () => ({
  LanguagesTable: ({
    languages,
    onEdit,
    onDelete,
  }: {
    languages: ApiLanguage[];
    onEdit: (lang: ApiLanguage) => void;
    onDelete: (lang: ApiLanguage) => void;
  }) => (
    <div data-testid="languages-table">
      {languages.map((l) => (
        <div key={l.id} data-testid={`table-lang-${l.id}`}>
          <span>{l.name}</span>
          <button data-testid={`edit-btn-${l.id}`} onClick={() => onEdit(l)}>
            Edit
          </button>
          <button
            data-testid={`delete-btn-${l.id}`}
            onClick={() => onDelete(l)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./modals/CreateLanguageModal', () => ({
  CreateLanguageModal: ({
    trigger,
    onSuccess,
  }: {
    trigger: React.ReactNode;
    onSuccess: () => void;
  }) => (
    <div data-testid="create-language-modal">
      {trigger}
      <button data-testid="trigger-create-success" onClick={onSuccess}>
        Create Success
      </button>
    </div>
  ),
}));

vi.mock('./modals/UpdateLanguageModal', () => ({
  UpdateLanguageModal: ({
    language,
    open,
    onSuccess,
    onOpenChange,
  }: {
    language: ApiLanguage;
    open: boolean;
    onSuccess: () => void;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="update-language-modal"
      data-language-id={language.id}
      data-open={open}
    >
      <button
        data-testid="trigger-update-success"
        onClick={() => void onSuccess()}
      >
        Update Success
      </button>
      <button
        data-testid="close-update-modal"
        onClick={() => onOpenChange(false)}
      >
        Close Update
      </button>
      <button data-testid="true-open-update" onClick={() => onOpenChange(true)}>
        True Open Update
      </button>
    </div>
  ),
}));

vi.mock('./modals/DeleteLanguageModal', () => ({
  DeleteLanguageModal: ({
    languageId,
    open,
    onSuccess,
    onOpenChange,
  }: {
    languageId: string;
    open: boolean;
    onSuccess: () => void;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="delete-language-modal"
      data-language-id={languageId}
      data-open={open}
    >
      <button
        data-testid="trigger-delete-success"
        onClick={() => void onSuccess()}
      >
        Delete Success
      </button>
      <button
        data-testid="close-delete-modal"
        onClick={() => onOpenChange(false)}
      >
        Close Delete
      </button>
      <button data-testid="true-open-delete" onClick={() => onOpenChange(true)}>
        True Open Delete
      </button>
    </div>
  ),
}));

describe('AdminLanguagesContent', () => {
  const sampleLanguages: ApiLanguage[] = [
    {
      id: '1',
      name: 'English',
      iso2: 'en',
      native_name: 'English',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'French',
      iso2: 'fr',
      native_name: 'Français',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];

  const defaultLanguagesReturn = {
    paginatedItems: sampleLanguages,
    allItems: sampleLanguages,
    loading: false,
    error: false,
    search: '',
    setSearch: mockSetSearch,
    sortBy: 'name' as const,
    sortDirection: 'asc' as const,
    handleSort: mockHandleSort,
    currentPage: 1,
    totalPages: 3,
    pageSize: 10,
    setCurrentPage: mockSetCurrentPage,
    setPageSize: mockSetPageSize,
    handleRefresh: mockHandleRefresh,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLanguages.mockReturnValue(defaultLanguagesReturn);
  });

  it('should render ContentLayout with languages table, create action trigger, and search setup', () => {
    render(<AdminLanguagesContent />);

    const layout = screen.getByTestId('content-layout');
    expect(layout.getAttribute('data-is-loading')).toBe('false');
    expect(layout.getAttribute('data-has-error')).toBe('false');
    expect(layout.getAttribute('data-error-message')).toBe(
      'Failed to load languages',
    );

    expect(screen.getByTestId('languages-table')).toBeDefined();
    expect(screen.getByTestId('table-lang-1')).toBeDefined();
    expect(screen.getByTestId('table-lang-2')).toBeDefined();

    expect(screen.getByTestId('create-language-modal')).toBeDefined();
    expect(screen.getByTestId('create-language-button')).toBeDefined();
    expect(screen.getByTestId('plus-icon')).toBeDefined();
    expect(screen.getByText('Create Language')).toBeDefined();
  });

  it('should handle search input changes and refresh callbacks correctly', () => {
    render(<AdminLanguagesContent />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Eng' } });
    expect(mockSetSearch).toHaveBeenCalledWith('Eng');

    const retryButton = screen.getByTestId('retry-button');
    fireEvent.click(retryButton);
    expect(mockHandleRefresh).toHaveBeenCalledTimes(1);
  });

  it('should open and handle success for CreateLanguageModal', () => {
    render(<AdminLanguagesContent />);

    const createSuccessBtn = screen.getByTestId('trigger-create-success');
    fireEvent.click(createSuccessBtn);

    expect(mockHandleRefresh).toHaveBeenCalledTimes(1);
  });

  it('should open, update, and close UpdateLanguageModal when editing a language', () => {
    render(<AdminLanguagesContent />);

    const editBtn1 = screen.getByTestId('edit-btn-1');
    fireEvent.click(editBtn1);

    const updateModal = screen.getByTestId('update-language-modal');
    expect(updateModal.getAttribute('data-language-id')).toBe('1');
    expect(updateModal.getAttribute('data-open')).toBe('true');

    const trueOpenUpdateBtn = screen.getByTestId('true-open-update');
    fireEvent.click(trueOpenUpdateBtn);
    expect(screen.getByTestId('update-language-modal')).toBeDefined();

    const updateSuccessBtn = screen.getByTestId('trigger-update-success');
    fireEvent.click(updateSuccessBtn);

    expect(mockHandleRefresh).toHaveBeenCalledTimes(1);

    const closeUpdateBtn = screen.getByTestId('close-update-modal');
    fireEvent.click(closeUpdateBtn);

    expect(screen.queryByTestId('update-language-modal')).toBeNull();
  });

  it('should open, delete, and close DeleteLanguageModal when deleting a language', () => {
    render(<AdminLanguagesContent />);

    const deleteBtn2 = screen.getByTestId('delete-btn-2');
    fireEvent.click(deleteBtn2);

    const deleteModal = screen.getByTestId('delete-language-modal');
    expect(deleteModal.getAttribute('data-language-id')).toBe('2');
    expect(deleteModal.getAttribute('data-open')).toBe('true');

    const trueOpenDeleteBtn = screen.getByTestId('true-open-delete');
    fireEvent.click(trueOpenDeleteBtn);
    expect(screen.getByTestId('delete-language-modal')).toBeDefined();

    const deleteSuccessBtn = screen.getByTestId('trigger-delete-success');
    fireEvent.click(deleteSuccessBtn);

    expect(mockHandleRefresh).toHaveBeenCalledTimes(1);

    const closeDeleteBtn = screen.getByTestId('close-delete-modal');
    fireEvent.click(closeDeleteBtn);

    expect(screen.queryByTestId('delete-language-modal')).toBeNull();
  });
});
