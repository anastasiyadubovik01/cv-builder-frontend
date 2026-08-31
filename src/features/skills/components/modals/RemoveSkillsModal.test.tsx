import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RemoveSkillsModal } from './RemoveSkillsModal';
import React from 'react';

const mockHandleRemove = vi.fn();
const mockLoading = { value: false };

vi.mock('@/features/skills/hooks/useRemoveUserSkills', () => ({
  useRemoveUserSkills: () => ({
    handleRemove: mockHandleRemove,
    loading: mockLoading.value,
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'skills.removeDialog.title': 'Remove Skills Title',
      };
      if (key === 'skills.removeDialog.description') {
        return `Remove count: ${options?.count ?? 0}`;
      }
      return translations[key] || key;
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
    onConfirm: () => void;
  }) => (
    <div
      data-testid="delete-count-dialog"
      data-open={String(open)}
      data-title={title}
      data-description={description}
      data-confirm-disabled={String(confirmDisabled)}
    >
      <button
        data-testid="count-dialog-toggle"
        onClick={() => onOpenChange(!open)}
      >
        Toggle
      </button>
      <button
        data-testid="count-confirm-btn"
        disabled={confirmDisabled}
        onClick={onConfirm}
      >
        Confirm Remove
      </button>
    </div>
  ),
}));

describe('RemoveSkillsModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading.value = false;
  });

  it('correctly initializes hook, renders translated content with correct count, and invokes removal', () => {
    const selectedSkills = ['1', '2'];

    render(
      <RemoveSkillsModal
        userId="1"
        selectedSkills={selectedSkills}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    const dialogWrapper = screen.getByTestId('delete-count-dialog');
    expect(dialogWrapper).toHaveAttribute('data-open', 'true');
    expect(dialogWrapper).toHaveAttribute('data-title', 'Remove Skills Title');
    expect(dialogWrapper).toHaveAttribute(
      'data-description',
      'Remove count: 2',
    );
    expect(dialogWrapper).toHaveAttribute('data-confirm-disabled', 'false');

    fireEvent.click(screen.getByTestId('count-dialog-toggle'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByTestId('count-confirm-btn'));
    expect(mockHandleRemove).toHaveBeenCalledWith(selectedSkills);
  });

  it('disables confirm action when loading is true', () => {
    mockLoading.value = true;

    render(
      <RemoveSkillsModal
        userId="1"
        selectedSkills={['1']}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    const dialogWrapper = screen.getByTestId('delete-count-dialog');
    expect(dialogWrapper).toHaveAttribute('data-confirm-disabled', 'true');
    expect(screen.getByTestId('count-confirm-btn')).toBeDisabled();
  });
});
