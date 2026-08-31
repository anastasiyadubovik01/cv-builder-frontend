import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeSkillModal } from './ChangeSkillModal';
import type { ApiSkill } from '@/api/skills';
import React from 'react';

const mockSetFieldValue = vi.fn();
const mockValidateField = vi.fn().mockReturnValue(true);
const mockHandleSubmit = vi.fn().mockResolvedValue(true);

const mockSkills: ApiSkill[] = [
  {
    id: '1',
    name: 'JavaScript',
    category: {
      id: '1',
      name: 'Programming',
      order: 1,
      parent: { id: '1', name: 'Languages' },
    },
    category_name: 'Programming',
    category_parent_name: 'Languages',
  },
  {
    id: '2',
    name: 'React',
    category: {
      id: '2',
      name: 'Frontend',
      order: 2,
      parent: { id: '1', name: 'Languages' },
    },
    category_name: 'Frontend',
    category_parent_name: 'Languages',
  },
];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'skills.skill': 'Skill',
        'skills.mastery': 'Mastery',
        'validation.required': 'Field is required',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/components/dialogs/ChangeDialog', () => ({
  ChangeDialog: ({
    actionTitle,
    open,
    onOpenChange,
    onConfirm,
    confirmDisabled,
    children,
  }: {
    actionTitle: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm: () => Promise<boolean>;
    confirmDisabled: boolean;
    children: React.ReactNode;
  }) => (
    <div
      data-testid="change-dialog"
      data-title={actionTitle}
      data-open={String(open)}
    >
      <button data-testid="dialog-toggle" onClick={() => onOpenChange?.(!open)}>
        Toggle Dialog
      </button>
      <button
        data-testid="confirm-btn"
        disabled={confirmDisabled}
        onClick={() => void onConfirm()}
      >
        Confirm
      </button>
      <div data-testid="dialog-content">{children}</div>
    </div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    onOpenChange,
    disabled,
    children,
  }: {
    value: string;
    onValueChange: (val: string) => void;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <div
      data-testid="select-root"
      data-value={value}
      data-disabled={String(disabled)}
    >
      <button
        data-testid="select-change-empty"
        onClick={() => onValueChange('')}
      >
        Change Empty Value
      </button>
      <button
        data-testid="select-change-trigger"
        onClick={() => onValueChange('React')}
      >
        Change Value
      </button>
      <button
        data-testid="select-close-trigger"
        onClick={() => onOpenChange?.(false)}
      >
        Close Select
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="select-trigger" data-label={label} data-error={error}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <div data-testid={`select-item-${value}`}>{children}</div>,
}));

describe('ChangeSkillModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default options and handles selection changes', () => {
    render(
      <ChangeSkillModal
        type="Create"
        open={true}
        skills={mockSkills}
        formData={{ skillName: 'JavaScript', mastery: 'Advanced' }}
        errors={{}}
        loading={false}
        isValid={true}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    expect(screen.getByTestId('change-dialog')).toHaveAttribute(
      'data-title',
      'Create',
    );
    expect(screen.getByTestId('change-dialog')).toHaveAttribute(
      'data-open',
      'true',
    );

    const selectRoots = screen.getAllByTestId('select-root');
    expect(selectRoots).toHaveLength(2);

    const changeButtons = screen.getAllByTestId('select-change-trigger');
    fireEvent.click(changeButtons[0]);
    expect(mockSetFieldValue).toHaveBeenCalledWith('skillName', 'React', {
      shouldValidate: true,
    });

    fireEvent.click(changeButtons[1]);
    expect(mockSetFieldValue).toHaveBeenCalledWith('mastery', 'React', {
      shouldValidate: true,
    });
  });

  it('does not call setFieldValue when empty value is selected', () => {
    render(
      <ChangeSkillModal
        type="Create"
        open={true}
        skills={mockSkills}
        formData={{ skillName: 'JavaScript', mastery: 'Advanced' }}
        errors={{}}
        loading={false}
        isValid={true}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    const emptyChangeButtons = screen.getAllByTestId('select-change-empty');
    fireEvent.click(emptyChangeButtons[0]);
    fireEvent.click(emptyChangeButtons[1]);

    expect(mockSetFieldValue).not.toHaveBeenCalled();
  });

  it('handles field validation on select close and disables execution when loading', () => {
    render(
      <ChangeSkillModal
        type="Update"
        open={true}
        skillDisabled={true}
        skills={mockSkills}
        formData={{ skillName: '', mastery: 'Novice' }}
        errors={{ skillName: 'validation.required' }}
        loading={true}
        isValid={true}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    const selectRoots = screen.getAllByTestId('select-root');
    expect(selectRoots[0]).toHaveAttribute('data-disabled', 'true');

    const closeButtons = screen.getAllByTestId('select-close-trigger');
    fireEvent.click(closeButtons[0]);
    expect(mockValidateField).toHaveBeenCalledWith('skillName');

    fireEvent.click(closeButtons[1]);
    expect(mockValidateField).toHaveBeenCalledWith('mastery');

    const confirmBtn = screen.getByTestId('confirm-btn');
    expect(confirmBtn).toBeDisabled();

    fireEvent.click(confirmBtn);
    expect(mockHandleSubmit).not.toHaveBeenCalled();
  });
});
