import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteUserModal } from './DeleteUserModal';
import React from 'react';

const mockHandleDelete = vi.fn();
const mockOnSuccess = vi.fn();

vi.mock('@/features/users/hooks/useDeleteUser', () => ({
  useDeleteUser: () => ({
    handleDelete: mockHandleDelete,
  }),
}));

vi.mock('@/components/dialogs/DeleteDialog', () => ({
  DeleteDialog: ({
    name,
    itemType,
    onConfirm,
    open,
    onOpenChange,
  }: {
    name?: string;
    itemType: string;
    onConfirm: () => Promise<boolean>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) =>
    open ? (
      <div data-testid="delete-dialog">
        <span data-testid="dialog-name">{name}</span>
        <span data-testid="dialog-item-type">{itemType}</span>
        <button
          data-testid="dialog-confirm"
          onClick={async () => {
            await onConfirm();
          }}
        >
          Confirm Delete
        </button>
        <button
          data-testid="dialog-close"
          onClick={() => onOpenChange?.(false)}
        >
          Close
        </button>
      </div>
    ) : null,
}));

describe('DeleteUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render delete dialog with user name and user itemType', () => {
    render(
      <DeleteUserModal
        userId="123"
        name="John Doe"
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByTestId('delete-dialog')).toBeDefined();
    expect(screen.getByTestId('dialog-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('dialog-item-type')).toHaveTextContent('user');
  });

  it('should call handleDelete and onSuccess when deletion succeeds', async () => {
    mockHandleDelete.mockResolvedValueOnce(true);

    render(
      <DeleteUserModal
        userId="123"
        name="John Doe"
        open={true}
        onSuccess={mockOnSuccess}
      />,
    );

    const confirmBtn = screen.getByTestId('dialog-confirm');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledWith('123');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should call handleDelete but not onSuccess when deletion fails', async () => {
    mockHandleDelete.mockResolvedValueOnce(false);

    render(
      <DeleteUserModal
        userId="123"
        name="John Doe"
        open={true}
        onSuccess={mockOnSuccess}
      />,
    );

    const confirmBtn = screen.getByTestId('dialog-confirm');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledWith('123');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('should forward additional dialog props correctly', () => {
    const mockOnOpenChange = vi.fn();

    render(
      <DeleteUserModal
        userId="123"
        name="John Doe"
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    const closeBtn = screen.getByTestId('dialog-close');
    fireEvent.click(closeBtn);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
