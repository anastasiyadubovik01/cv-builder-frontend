import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteDialog } from './DeleteDialog';
import React from 'react';

const mockUseTranslation = vi.fn();
const mockGetItemTypeTranslation = vi.fn();
const mockGetActionTranslation = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
}));

vi.mock('@/components/dialogs/i18n', () => ({
  getItemTypeTranslation: (itemType: string, t: (key: string) => string) =>
    mockGetItemTypeTranslation(itemType, t),
  getActionTranslation: (actionTitle: string, t: (key: string) => string) =>
    mockGetActionTranslation(actionTitle, t),
}));

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="alert-dialog-root" data-open={String(open)}>
      <button
        data-testid="alert-dialog-toggle"
        onClick={() => onOpenChange?.(!open)}
      >
        Toggle Alert Dialog
      </button>
      {children}
    </div>
  ),
  AlertDialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-trigger">{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="alert-dialog-title">{children}</h2>
  ),
  AlertDialogDescription: ({
    className,
    children,
  }: {
    className?: string;
    children: React.ReactNode;
  }) => (
    <p data-testid="alert-dialog-description" className={className}>
      {children}
    </p>
  ),
  AlertDialogCloseButton: () => (
    <button data-testid="alert-dialog-close-btn">Close</button>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
  AlertDialogAction: ({
    onClick,
    children,
  }: {
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button data-testid="alert-dialog-action" onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('DeleteDialog', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'dialogs.common.cancel': 'Cancel',
      'dialogs.common.confirm': 'Confirm',
      'dialogs.delete.description': 'Are you sure you want to delete',
    };
    return translations[key] || key;
  });
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    name: 'Engineering',
    itemType: 'department' as const,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({ t: mockT });
    mockGetItemTypeTranslation.mockImplementation(
      (type) => `Translated_${type}`,
    );
    mockGetActionTranslation.mockImplementation(
      (title) => `Translated_${title}`,
    );
  });

  it('renders correctly with default actionTitle, uncontrolled state, and custom translations', () => {
    render(
      <DeleteDialog
        {...defaultProps}
        trigger={<button data-testid="custom-trigger">Delete</button>}
      />,
    );

    const dialogRoot = screen.getByTestId('alert-dialog-root');
    expect(dialogRoot).toHaveAttribute('data-open', 'false');

    expect(screen.getByTestId('custom-trigger')).toBeDefined();
    expect(screen.getByTestId('alert-dialog-title').textContent).toBe(
      'Translated_Delete Translated_department',
    );

    const description = screen.getByTestId('alert-dialog-description');
    expect(description.textContent).toContain(
      'Are you sure you want to delete',
    );
    expect(description.textContent).toContain('Translated_department');
    expect(description.textContent).toContain('Engineering');
    expect(description.textContent).toContain('?');

    expect(screen.getByTestId('alert-dialog-cancel').textContent).toBe(
      'Cancel',
    );
    expect(screen.getByTestId('alert-dialog-action').textContent).toBe(
      'Confirm',
    );

    fireEvent.click(screen.getByTestId('alert-dialog-toggle'));
    expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('supports custom actionTitle and controlled open state', () => {
    render(
      <DeleteDialog
        {...defaultProps}
        actionTitle="Remove"
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(mockGetActionTranslation).toHaveBeenCalledWith('Remove', mockT);
    expect(screen.getByTestId('alert-dialog-title').textContent).toBe(
      'Translated_Remove Translated_department',
    );
    expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('alert-dialog-toggle'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes dialog on successful confirmation and stays open if confirmation returns false', async () => {
    mockOnConfirm.mockResolvedValueOnce(true);

    const { unmount } = render(<DeleteDialog {...defaultProps} />);

    fireEvent.click(screen.getByTestId('alert-dialog-toggle'));
    expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('alert-dialog-action'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
        'data-open',
        'false',
      );
    });

    unmount();

    mockOnConfirm.mockResolvedValueOnce(false);

    render(<DeleteDialog {...defaultProps} />);

    fireEvent.click(screen.getByTestId('alert-dialog-toggle'));
    expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('alert-dialog-action'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
        'data-open',
        'true',
      );
    });
  });
});
