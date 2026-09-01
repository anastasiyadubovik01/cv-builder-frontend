import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteCountDialog } from './DeleteCountDialog';
import React from 'react';

const mockUseTranslation = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
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
    disabled,
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      data-testid="alert-dialog-action"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

describe('DeleteCountDialog', () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      'dialogs.common.cancel': 'Cancel',
      'dialogs.common.confirm': 'Confirm',
    };
    return translations[key] || key;
  });
  const mockOnConfirm = vi.fn();
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    title: 'Delete skills',
    description: 'Are you sure you want to remove 3 skills?',
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({ t: mockT });
  });

  it('renders correctly with uncontrolled state, appropriate props and translations', () => {
    render(
      <DeleteCountDialog
        {...defaultProps}
        trigger={<button data-testid="custom-trigger">Delete Count</button>}
      />,
    );

    const dialogRoot = screen.getByTestId('alert-dialog-root');
    expect(dialogRoot).toHaveAttribute('data-open', 'false');

    expect(screen.getByTestId('custom-trigger')).toBeDefined();
    expect(screen.getByTestId('alert-dialog-title').textContent).toBe(
      'Delete skills',
    );
    expect(screen.getByTestId('alert-dialog-description').textContent).toBe(
      'Are you sure you want to remove 3 skills?',
    );
    expect(screen.getByTestId('alert-dialog-cancel').textContent).toBe(
      'Cancel',
    );
    expect(screen.getByTestId('alert-dialog-action').textContent).toBe(
      'Confirm',
    );
    expect(screen.getByTestId('alert-dialog-action')).toHaveProperty(
      'disabled',
      false,
    );

    fireEvent.click(screen.getByTestId('alert-dialog-toggle'));
    expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
      'data-open',
      'true',
    );
  });

  it('handles controlled open state, external onOpenChange and confirmDisabled prop', () => {
    render(
      <DeleteCountDialog
        {...defaultProps}
        open={true}
        onOpenChange={mockOnOpenChange}
        confirmDisabled={true}
      />,
    );

    const dialogRoot = screen.getByTestId('alert-dialog-root');
    expect(dialogRoot).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('alert-dialog-action')).toHaveProperty(
      'disabled',
      true,
    );

    fireEvent.click(screen.getByTestId('alert-dialog-toggle'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes dialog when onConfirm resolves to true or undefined (void)', async () => {
    mockOnConfirm.mockResolvedValueOnce(true);

    render(<DeleteCountDialog {...defaultProps} open={true} />);

    fireEvent.click(screen.getByTestId('alert-dialog-action'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    mockOnConfirm.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByTestId('alert-dialog-toggle'));
    fireEvent.click(screen.getByTestId('alert-dialog-action'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
    });
  });

  it('does not close dialog when onConfirm explicitly returns false', async () => {
    mockOnConfirm.mockResolvedValueOnce(false);

    render(<DeleteCountDialog {...defaultProps} open={true} />);

    fireEvent.click(screen.getByTestId('alert-dialog-action'));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
        'data-open',
        'true',
      );
    });
  });
});
