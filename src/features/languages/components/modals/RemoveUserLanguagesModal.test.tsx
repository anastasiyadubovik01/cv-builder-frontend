import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RemoveUserLanguagesModal } from './RemoveUserLanguagesModal';

const mockHandleRemove = vi.fn().mockResolvedValue(true);
const mockUseRemoveUserLanguages = vi.fn().mockReturnValue({
  handleRemove: mockHandleRemove,
  loading: false,
});

vi.mock('@/features/languages/hooks/useRemoveUserLanguages', () => ({
  useRemoveUserLanguages: (args: unknown) => mockUseRemoveUserLanguages(args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      if (key === 'users.languages.removeDialog.title') {
        return 'Remove Languages';
      }
      if (key === 'users.languages.removeDialog.description') {
        return `Are you sure you want to remove ${options?.count || 0} languages?`;
      }
      return key;
    },
  }),
}));

vi.mock('@/components/dialogs/DeleteCountDialog', () => ({
  DeleteCountDialog: ({
    open,
    onOpenChange,
    title,
    description,
    confirmDisabled,
    onConfirm,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmDisabled: boolean;
    onConfirm: () => Promise<boolean>;
  }) => (
    <div
      data-testid="delete-count-dialog"
      data-open={String(open)}
      data-confirm-disabled={String(confirmDisabled)}
    >
      <div data-testid="dialog-title">{title}</div>
      <div data-testid="dialog-description">{description}</div>
      <button
        data-testid="count-confirm-btn"
        disabled={confirmDisabled}
        onClick={() => void onConfirm()}
      >
        Confirm Remove
      </button>
      <button
        data-testid="count-toggle-btn"
        onClick={() => onOpenChange(!open)}
      >
        Toggle
      </button>
    </div>
  ),
}));

describe('RemoveUserLanguagesModal', () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();
  const selectedLanguages = ['en', 'de', 'es'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useRemoveUserLanguages, render DeleteCountDialog with correct translated props, and execute handleRemove on confirmation', async () => {
    render(
      <RemoveUserLanguagesModal
        userId="123"
        selectedLanguages={selectedLanguages}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseRemoveUserLanguages).toHaveBeenCalledTimes(1);
    expect(mockUseRemoveUserLanguages).toHaveBeenCalledWith({
      userId: '123',
      onSuccess: mockOnSuccess,
    });

    const dialog = screen.getByTestId('delete-count-dialog');
    expect(dialog.getAttribute('data-open')).toBe('true');
    expect(dialog.getAttribute('data-confirm-disabled')).toBe('false');

    expect(screen.getByTestId('dialog-title').textContent).toBe(
      'Remove Languages',
    );
    expect(screen.getByTestId('dialog-description').textContent).toBe(
      'Are you sure you want to remove 3 languages?',
    );

    const confirmBtn = screen.getByTestId('count-confirm-btn');
    fireEvent.click(confirmBtn);
    expect(mockHandleRemove).toHaveBeenCalledWith(selectedLanguages);

    const toggleBtn = screen.getByTestId('count-toggle-btn');
    fireEvent.click(toggleBtn);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should disable confirm button when loading is true', () => {
    mockUseRemoveUserLanguages.mockReturnValueOnce({
      handleRemove: mockHandleRemove,
      loading: true,
    });

    render(
      <RemoveUserLanguagesModal
        userId="123"
        selectedLanguages={selectedLanguages}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    const dialog = screen.getByTestId('delete-count-dialog');
    expect(dialog.getAttribute('data-confirm-disabled')).toBe('true');
  });
});
