import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserLanguagesContent } from './UserLanguagesContent';

const mockRefetchUserLanguages = vi.fn().mockResolvedValue(undefined);
const mockHandleRefresh = vi.fn().mockResolvedValue(undefined);

const mockUseUserLanguagesReturn = {
  profileLanguages: [
    { name: 'English', proficiency: 'ADVANCED' as const },
    { name: 'Spanish', proficiency: 'INTERMEDIATE' as const },
  ],
  availableLanguages: [
    {
      id: '1',
      name: 'English',
      iso2: 'en',
      native_name: 'English',
      created_at: '2026-01-01',
    },
    {
      id: '2',
      name: 'Spanish',
      iso2: 'es',
      native_name: 'Español',
      created_at: '2026-01-01',
    },
    {
      id: '3',
      name: 'French',
      iso2: 'fr',
      native_name: 'Français',
      created_at: '2026-01-01',
    },
  ],
  loading: false,
  error: false,
  refetchUserLanguages: mockRefetchUserLanguages,
  handleRefresh: mockHandleRefresh,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, options?: Record<string, unknown>) => {
      const count =
        options?.count !== undefined
          ? options.count
          : key.includes('1')
            ? 1
            : 0;
      const translations: Record<string, string> = {
        'users.languages.loadError': 'Failed to load languages',
        'users.languages.empty': 'No languages added',
        'users.languages.current': 'Current Languages',
        'dialogs.common.cancel': 'Cancel',
        'users.languages.removeSelected': `Remove Selected (${count})`,
        'users.languages.add': 'Add Language',
        'users.languages.remove': 'Remove Languages',
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
    children,
  }: {
    isLoading: boolean;
    hasError: boolean;
    errorMessage: string;
    onRetry: () => Promise<void>;
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
      <div data-testid="content-children">{children}</div>
    </div>
  ),
}));

vi.mock('@/features/languages/components/LanguageProficiencyProgress', () => ({
  LanguageProficiencyProgress: ({
    proficiency,
    selected,
  }: {
    proficiency: string;
    selected: boolean;
  }) => (
    <div
      data-testid="proficiency-progress"
      data-proficiency={proficiency}
      data-selected={String(selected)}
    >
      Progress
    </div>
  ),
}));

vi.mock('@/features/languages/components/modals/AddUserLanguageModal', () => ({
  AddUserLanguageModal: ({
    onSuccess,
    trigger,
  }: {
    onSuccess: () => void;
    trigger: React.ReactNode;
  }) => (
    <div data-testid="add-user-language-modal">
      <div data-testid="add-modal-trigger">{trigger}</div>
      <button
        data-testid="trigger-add-success"
        onClick={() => void onSuccess()}
      >
        Add Success
      </button>
    </div>
  ),
}));

vi.mock(
  '@/features/languages/components/modals/UpdateUserLanguageModal',
  () => ({
    UpdateUserLanguageModal: ({
      open,
      onOpenChange,
      onSuccess,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSuccess: () => void;
    }) =>
      open ? (
        <div data-testid="update-user-language-modal">
          <button
            data-testid="close-update"
            onClick={() => onOpenChange(false)}
          >
            Close Update
          </button>
          <button data-testid="success-update" onClick={() => void onSuccess()}>
            Success Update
          </button>
        </div>
      ) : null,
  }),
);

vi.mock(
  '@/features/languages/components/modals/RemoveUserLanguagesModal',
  () => ({
    RemoveUserLanguagesModal: ({
      open,
      onOpenChange,
      onSuccess,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSuccess: () => void;
    }) =>
      open ? (
        <div data-testid="remove-user-languages-modal">
          <button
            data-testid="close-remove"
            onClick={() => onOpenChange(false)}
          >
            Close Remove
          </button>
          <button data-testid="success-remove" onClick={() => void onSuccess()}>
            Success Remove
          </button>
        </div>
      ) : null,
  }),
);

vi.mock('@/features/users/hooks/useUserLanguages', () => ({
  useUserLanguages: () => mockUseUserLanguagesReturn,
}));

describe('UserLanguagesContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render current languages and allow management when canManage is true', () => {
    render(<UserLanguagesContent userId="user-1" canManage={true} />);

    expect(screen.getByTestId('content-layout')).toBeDefined();
    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('Spanish')).toBeDefined();
    expect(screen.getByTestId('add-user-language-modal')).toBeDefined();
  });

  it('should not allow opening modals or editing when canManage is false', () => {
    render(<UserLanguagesContent userId="user-1" canManage={false} />);

    const englishButton = screen.getByText('English').closest('button');
    expect(englishButton?.getAttribute('disabled')).not.toBeNull();
    expect(screen.queryByTestId('add-user-language-modal')).toBeNull();
  });

  it('should open update modal when language is clicked in normal mode and reset when closed', () => {
    render(<UserLanguagesContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByText('English'));
    expect(screen.getByTestId('update-user-language-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('close-update'));
    expect(screen.queryByTestId('update-user-language-modal')).toBeNull();

    fireEvent.click(screen.getByText('English'));
    fireEvent.click(screen.getByTestId('success-update'));
    expect(mockRefetchUserLanguages).toHaveBeenCalled();
  });

  it('should handle remove mode selection toggle (select and deselect language)', () => {
    render(<UserLanguagesContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByText('Remove Languages'));

    const englishButton = screen.getByText('English').closest('button')!;

    fireEvent.click(englishButton);
    const removeBtn = screen.getByText((content) =>
      content.includes('Remove Selected'),
    );
    expect(removeBtn).toBeDefined();

    fireEvent.click(englishButton);

    fireEvent.click(englishButton);

    fireEvent.click(removeBtn);
    expect(screen.getByTestId('remove-user-languages-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('success-remove'));
    expect(mockRefetchUserLanguages).toHaveBeenCalled();
  });

  it('should handle cancel remove mode correctly', () => {
    render(<UserLanguagesContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByText('Remove Languages'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.getByText('Remove Languages')).toBeDefined();
  });

  it('should handle add language success correctly', async () => {
    render(<UserLanguagesContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByTestId('trigger-add-success'));
    expect(mockRefetchUserLanguages).toHaveBeenCalled();
  });

  it('should handle retry action correctly', () => {
    render(<UserLanguagesContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByTestId('retry-btn'));
    expect(mockHandleRefresh).toHaveBeenCalled();
  });
});
