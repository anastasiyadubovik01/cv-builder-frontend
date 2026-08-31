import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteLanguageModal } from './DeleteLanguageModal';

const mockHandleDelete = vi.fn().mockResolvedValue(true);
const mockUseDeleteLanguage = vi.fn().mockReturnValue({
  handleDelete: mockHandleDelete,
});

vi.mock('../../hooks/useDeleteLanguage', () => ({
  useDeleteLanguage: (args: unknown) => mockUseDeleteLanguage(args),
}));

vi.mock('@/components/dialogs/DeleteDialog', () => ({
  DeleteDialog: ({
    name,
    itemType,
    onConfirm,
    open,
    onOpenChange,
  }: {
    name: string;
    itemType: string;
    onConfirm: () => Promise<boolean>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="delete-dialog"
      data-name={name}
      data-item-type={itemType}
      data-open={String(open)}
    >
      <button data-testid="delete-confirm-btn" onClick={() => void onConfirm()}>
        Confirm Delete
      </button>
      <button
        data-testid="delete-toggle-btn"
        onClick={() => onOpenChange(!open)}
      >
        Toggle
      </button>
    </div>
  ),
}));

describe('DeleteLanguageModal', () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useDeleteLanguage, render DeleteDialog with correct itemType, and execute handleDelete on confirmation', async () => {
    render(
      <DeleteLanguageModal
        languageId="123"
        name="Spanish"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseDeleteLanguage).toHaveBeenCalledTimes(1);
    expect(mockUseDeleteLanguage).toHaveBeenCalledWith({
      onSuccess: mockOnSuccess,
    });

    const dialog = screen.getByTestId('delete-dialog');
    expect(dialog.getAttribute('data-name')).toBe('Spanish');
    expect(dialog.getAttribute('data-item-type')).toBe('language');
    expect(dialog.getAttribute('data-open')).toBe('true');

    const confirmBtn = screen.getByTestId('delete-confirm-btn');
    fireEvent.click(confirmBtn);

    expect(mockHandleDelete).toHaveBeenCalledWith('123');

    const toggleBtn = screen.getByTestId('delete-toggle-btn');
    fireEvent.click(toggleBtn);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
