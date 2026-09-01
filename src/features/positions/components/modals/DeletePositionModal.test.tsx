import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeletePositionModal } from './DeletePositionModal';
import React from 'react';

const mockHandleDelete = vi.fn().mockResolvedValue(true);
const mockUseDeletePosition = vi.fn(() => ({
  handleDelete: mockHandleDelete,
}));

vi.mock('../../hooks/useDeletePosition', () => ({
  useDeletePosition: () => mockUseDeletePosition(),
}));

vi.mock('@/components/dialogs/DeleteDialog', () => ({
  DeleteDialog: (props: unknown) => {
    const typedProps = props as {
      name?: string;
      itemType: string;
      onConfirm: () => Promise<boolean>;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    };
    return (
      <div
        data-testid="delete-dialog"
        data-name={typedProps.name}
        data-item-type={typedProps.itemType}
        data-open={String(typedProps.open)}
      >
        <button
          data-testid="dialog-confirm-btn"
          onClick={() => void typedProps.onConfirm()}
        >
          Confirm Delete
        </button>
        {typedProps.onOpenChange && (
          <button
            data-testid="dialog-toggle-btn"
            onClick={() => typedProps.onOpenChange?.(false)}
          >
            Toggle Close
          </button>
        )}
      </div>
    );
  },
}));

describe('DeletePositionModal', () => {
  const mockOnSuccess = vi.fn();
  const defaultProps = {
    positionId: '123',
    name: 'Developer',
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DeleteDialog correctly and invokes useDeletePosition with onSuccess', async () => {
    render(<DeletePositionModal {...defaultProps} />);

    expect(mockUseDeletePosition).toHaveBeenCalled();

    const dialog = screen.getByTestId('delete-dialog');
    expect(dialog).toHaveAttribute('data-name', 'Developer');
    expect(dialog).toHaveAttribute('data-item-type', 'position');
    expect(dialog).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getByTestId('dialog-confirm-btn'));
    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledWith('123');
    });
  });

  it('works correctly when optional props like onSuccess are omitted', async () => {
    render(<DeletePositionModal positionId="456" name="Manager" />);

    const dialog = screen.getByTestId('delete-dialog');
    expect(dialog).toHaveAttribute('data-item-type', 'position');
    expect(dialog).toHaveAttribute('data-name', 'Manager');

    fireEvent.click(screen.getByTestId('dialog-confirm-btn'));
    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledWith('456');
    });
  });
});
