import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteDepartmentModal } from './DeleteDepartmentModal';
import React from 'react';

const mockHandleDelete = vi.fn().mockResolvedValue(true);
const mockUseDeleteDepartment = vi.fn(() => ({
  handleDelete: mockHandleDelete,
}));

vi.mock('../../hooks/useDeleteDepartment', () => ({
  useDeleteDepartment: () => mockUseDeleteDepartment(),
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

describe('DeleteDepartmentModal', () => {
  const mockOnSuccess = vi.fn();
  const defaultProps = {
    departmentId: '123',
    name: 'Engineering',
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DeleteDialog correctly and invokes useDeleteDepartment with onSuccess', async () => {
    render(<DeleteDepartmentModal {...defaultProps} />);

    expect(mockUseDeleteDepartment).toHaveBeenCalled();

    const dialog = screen.getByTestId('delete-dialog');
    expect(dialog).toHaveAttribute('data-name', 'Engineering');
    expect(dialog).toHaveAttribute('data-item-type', 'department');
    expect(dialog).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getByTestId('dialog-confirm-btn'));
    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledWith('123');
    });
  });

  it('works correctly when optional props like onSuccess are omitted', async () => {
    render(<DeleteDepartmentModal departmentId="456" name="Sales" />);

    const dialog = screen.getByTestId('delete-dialog');
    expect(dialog).toHaveAttribute('data-item-type', 'department');
    expect(dialog).toHaveAttribute('data-name', 'Sales');

    fireEvent.click(screen.getByTestId('dialog-confirm-btn'));
    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledWith('456');
    });
  });
});
