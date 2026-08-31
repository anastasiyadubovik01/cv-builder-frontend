import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSkillsContent } from './UserSkillsContent';

const mockHandleRefetch = vi.fn().mockResolvedValue(undefined);

const mockUseUserSkillsReturn = {
  profileSkills: [
    { name: 'React', mastery: 'ADVANCED' as const, categoryId: 'cat-1' },
    { name: 'Python', mastery: 'INTERMEDIATE' as const, categoryId: 'cat-2' },
  ],
  availableSkills: [
    { id: 's-1', name: 'React', category: { id: 'cat-1', name: 'Frontend' } },
    { id: 's-2', name: 'Python', category: { id: 'cat-2', name: 'Backend' } },
  ],
  loading: false,
  error: false,
  handleRefetch: mockHandleRefetch,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'skills.loadError': 'Failed to load skills',
        'skills.empty': 'No skills added',
        'skills.uncategorized': 'Uncategorized',
        'dialogs.common.cancel': 'Cancel',
        'skills.add': 'Add Skill',
        'skills.remove': 'Remove Skills',
      };
      if (key === 'skills.removeSelected') {
        return `Remove Selected (${options?.count ?? 0})`;
      }
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

vi.mock('@/features/skills/components/SkillMasteryProgress', () => ({
  SkillMasteryProgress: ({
    mastery,
    selected,
  }: {
    mastery: string;
    selected: boolean;
  }) => (
    <div
      data-testid={`skill-mastery-${mastery}`}
      data-selected={String(selected)}
    >
      Progress {mastery}
    </div>
  ),
}));

vi.mock('@/features/skills/components/AddSkillModal', () => ({
  AddSkillModal: ({
    onSuccess,
    trigger,
  }: {
    onSuccess: () => void;
    trigger: React.ReactNode;
  }) => (
    <div data-testid="add-skill-modal">
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

vi.mock('@/features/skills/components/UpdateSkillModal', () => ({
  UpdateSkillModal: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
  }) =>
    open ? (
      <div data-testid="update-skill-modal">
        <button data-testid="close-update" onClick={() => onOpenChange(false)}>
          Close Update
        </button>
        <button data-testid="success-update" onClick={() => void onSuccess()}>
          Success Update
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/skills/components/RemoveSkillsModal', () => ({
  RemoveSkillsModal: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
  }) =>
    open ? (
      <div data-testid="remove-skills-modal">
        <button data-testid="close-remove" onClick={() => onOpenChange(false)}>
          Close Remove
        </button>
        <button data-testid="success-remove" onClick={() => void onSuccess()}>
          Success Remove
        </button>
      </div>
    ) : null,
}));

vi.mock('@/features/users/hooks/useUserSkills', () => ({
  useUserSkills: () => mockUseUserSkillsReturn,
}));

describe('UserSkillsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render grouped skills and allow management when canManage is true', () => {
    render(<UserSkillsContent userId="user-1" canManage={true} />);

    expect(screen.getByTestId('content-layout')).toBeDefined();
    expect(screen.getByText('Frontend')).toBeDefined();
    expect(screen.getByText('Backend')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Python')).toBeDefined();
    expect(screen.getByTestId('add-skill-modal')).toBeDefined();
  });

  it('should not allow opening modals or editing when canManage is false', () => {
    render(<UserSkillsContent userId="user-1" canManage={false} />);

    const reactButton = screen.getByText('React').closest('button');
    expect(reactButton).toBeDefined();
    expect(reactButton?.getAttribute('disabled')).not.toBeNull();
    expect(screen.queryByTestId('add-skill-modal')).toBeNull();
  });

  it('should open update modal when skill is clicked in normal mode and reset when closed', async () => {
    render(<UserSkillsContent userId="user-1" canManage={true} />);

    const reactButton = screen.getByText('React').closest('button');
    expect(reactButton).toBeDefined();
    fireEvent.click(reactButton!);
    expect(screen.getByTestId('update-skill-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('close-update'));
    expect(screen.queryByTestId('update-skill-modal')).toBeNull();

    fireEvent.click(reactButton!);
    fireEvent.click(screen.getByTestId('success-update'));
    expect(mockHandleRefetch).toHaveBeenCalled();
  });

  it('should handle remove mode selection toggle and open remove dialog with successful removal flow', async () => {
    render(<UserSkillsContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByText('Remove Skills'));

    const reactCardButton = screen.getByText('React').closest('button');
    fireEvent.click(reactCardButton!);

    const removeBtn = screen.getByRole('button', { name: /Remove Selected/i });
    expect(removeBtn).not.toBeDisabled();

    fireEvent.click(removeBtn);
    expect(screen.getByTestId('remove-skills-modal')).toBeDefined();

    fireEvent.click(screen.getByTestId('success-remove'));
    expect(mockHandleRefetch).toHaveBeenCalled();
  });

  it('should handle cancel remove mode correctly', async () => {
    render(<UserSkillsContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByText('Remove Skills'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.getByText('Remove Skills')).toBeDefined();
  });

  it('should handle add skill success correctly', async () => {
    render(<UserSkillsContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByTestId('trigger-add-success'));
    expect(mockHandleRefetch).toHaveBeenCalled();
  });

  it('should handle retry action correctly', async () => {
    render(<UserSkillsContent userId="user-1" canManage={true} />);

    fireEvent.click(screen.getByTestId('retry-btn'));
    expect(mockHandleRefetch).toHaveBeenCalled();
  });
});
