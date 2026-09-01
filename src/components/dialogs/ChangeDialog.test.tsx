import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeDialog } from './ChangeDialog';
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

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="dialog-root" data-open={String(open)}>
      <button data-testid="dialog-toggle" onClick={() => onOpenChange?.(!open)}>
        Toggle Dialog
      </button>
      {children}
    </div>
  ),
  DialogTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogContent: ({
    size,
    children,
  }: {
    size?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="dialog-content" data-size={size}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogCloseButton: () => (
    <button data-testid="dialog-close-btn">Close</button>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
  DialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="dialog-cancel">{children}</button>
  ),
  DialogAction: ({
    onClick,
    disabled,
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button data-testid="dialog-action" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

describe('ChangeDialog', () => {
  const mockT = vi.fn((key: string) => key);
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    actionTitle: 'Create' as const,
    itemType: 'position' as const,
    children: <div data-testid="dialog-body">Form Children</div>,
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

  it('renders correctly with default uncontrolled state and translations', () => {
    render(
      <ChangeDialog
        {...defaultProps}
        trigger={<button data-testid="custom-trigger">Open</button>}
      />,
    );

    const dialogRoot = screen.getByTestId('dialog-root');
    expect(dialogRoot).toHaveAttribute('data-open', 'false');

    expect(screen.getByTestId('custom-trigger')).toBeDefined();
    expect(screen.getByTestId('dialog-body')).toBeDefined();
    expect(screen.getByTestId('dialog-title').textContent).toBe(
      'Translated_Create Translated_position',
    );
    expect(screen.getByTestId('dialog-cancel').textContent).toBe(
      'dialogs.common.cancel',
    );
    expect(screen.getByTestId('dialog-action').textContent).toBe(
      'Translated_Create',
    );

    fireEvent.click(screen.getByTestId('dialog-toggle'));
    expect(screen.getByTestId('dialog-root')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('handles controlled open state and external onOpenChange callback', () => {
    render(
      <ChangeDialog
        {...defaultProps}
        open={true}
        onOpenChange={mockOnOpenChange}
        confirmDisabled={true}
        size="sm"
      />,
    );

    const dialogRoot = screen.getByTestId('dialog-root');
    expect(dialogRoot).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('dialog-content')).toHaveAttribute(
      'data-size',
      'sm',
    );
    expect(screen.getByTestId('dialog-action')).toHaveProperty(
      'disabled',
      true,
    );

    fireEvent.click(screen.getByTestId('dialog-toggle'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles successful confirmation by closing the dialog (uncontrolled)', async () => {
    mockOnConfirm.mockResolvedValue(true);

    render(<ChangeDialog {...defaultProps} />);

    fireEvent.click(screen.getByTestId('dialog-toggle'));
    expect(screen.getByTestId('dialog-root')).toHaveAttribute(
      'data-open',
      'true',
    );

    fireEvent.click(screen.getByTestId('dialog-action'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('dialog-root')).toHaveAttribute(
        'data-open',
        'false',
      );
    });
  });

  it('does not close dialog if confirmation fails (returns false)', async () => {
    mockOnConfirm.mockResolvedValue(false);

    render(<ChangeDialog {...defaultProps} open={true} />);

    fireEvent.click(screen.getByTestId('dialog-action'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('dialog-root')).toHaveAttribute(
        'data-open',
        'true',
      );
    });
  });
});
