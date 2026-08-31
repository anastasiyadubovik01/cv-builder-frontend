import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteSkillModal } from './DeleteSkillModal';
import React from 'react';

const mockHandleDelete = vi.fn();

vi.mock('@/features/skills/hooks/useDeleteSkill', () => ({
  useDeleteSkill: () => ({
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
      <button data-testid="dialog-toggle" onClick={() => onOpenChange(!open)}>
        Toggle
      </button>
      <button data-testid="confirm-delete-btn" onClick={() => void onConfirm()}>
        Confirm Delete
      </button>
    </div>
  ),
}));

describe('DeleteSkillModal', () => {
  const mockOnSuccess = vi.fn().mockResolvedValue(undefined);
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('correctly uses useDeleteSkill, executes deletion and triggers success callback on success', async () => {
    mockHandleDelete.mockResolvedValueOnce(true);

    render(
      <DeleteSkillModal
        skillId="1"
        name="JavaScript"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    const dialogWrapper = screen.getByTestId('delete-dialog');
    expect(dialogWrapper).toHaveAttribute('data-name', 'JavaScript');
    expect(dialogWrapper).toHaveAttribute('data-item-type', 'skill');
    expect(dialogWrapper).toHaveAttribute('data-open', 'true');

    fireEvent.click(screen.getByTestId('dialog-toggle'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);

    await fireEvent.click(screen.getByTestId('confirm-delete-btn'));

    expect(mockHandleDelete).toHaveBeenCalledWith('1');
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('does not trigger onSuccess callback if deletion fails', async () => {
    mockHandleDelete.mockResolvedValueOnce(false);

    render(
      <DeleteSkillModal
        skillId="1"
        name="JavaScript"
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    await fireEvent.click(screen.getByTestId('confirm-delete-btn'));

    expect(mockHandleDelete).toHaveBeenCalledWith('1');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
