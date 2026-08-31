import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeSkillAdminModal } from './ChangeSkillAdminModal';
import type { SkillFormCategory } from './ChangeSkillAdminModal';
import React from 'react';

const mockSetFieldValue = vi.fn();
const mockValidateField = vi.fn().mockReturnValue(true);
const mockHandleSubmit = vi.fn().mockResolvedValue(true);

const mockCategories: SkillFormCategory[] = [
  { id: '1', name: 'Frontend' },
  { id: '2', name: 'Backend' },
];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'skills.admin.name': 'Skill Name',
        'skills.admin.category': 'Category',
        'skills.admin.validation.duplicate': 'Duplicate skill name',
        'skills.admin.error.required': 'Required error',
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
        Toggle
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

vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    placeholder,
    onChange,
    onBlur,
    'aria-invalid': ariaInvalid,
  }: {
    value: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean;
  }) => (
    <input
      data-testid="skill-input-field"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      onBlur={onBlur}
      aria-invalid={ariaInvalid}
    />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    onOpenChange,
    children,
  }: {
    value: string;
    onValueChange: (val: string) => void;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="select-root" data-value={value}>
      <button
        data-testid="select-change-empty"
        onClick={() => onValueChange('')}
      >
        Change Empty
      </button>
      <button
        data-testid="select-change-trigger"
        onClick={() => onValueChange('2')}
      >
        Change Category
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

describe('ChangeSkillAdminModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin skill modal correctly and triggers input changes and validation', () => {
    render(
      <ChangeSkillAdminModal
        type="Create"
        categories={mockCategories}
        open={true}
        formData={{ name: 'TypeScript', categoryId: '1' }}
        errors={{}}
        loading={false}
        isValid={true}
        isDuplicate={false}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    expect(screen.getByTestId('change-dialog')).toHaveAttribute(
      'data-title',
      'Create',
    );

    const inputField = screen.getByTestId('skill-input-field');
    fireEvent.change(inputField, { target: { value: 'JavaScript' } });
    expect(mockSetFieldValue).toHaveBeenCalledWith('name', 'JavaScript');

    fireEvent.blur(inputField);
    expect(mockValidateField).toHaveBeenCalledWith('name');

    fireEvent.click(screen.getByTestId('select-change-trigger'));
    expect(mockSetFieldValue).toHaveBeenCalledWith('categoryId', '2', {
      shouldValidate: true,
    });

    fireEvent.click(screen.getByTestId('select-close-trigger'));
    expect(mockValidateField).toHaveBeenCalledWith('categoryId');
  });

  it('does not call setFieldValue when empty value is selected in category select', () => {
    render(
      <ChangeSkillAdminModal
        type="Create"
        categories={mockCategories}
        open={true}
        formData={{ name: 'TypeScript', categoryId: '1' }}
        errors={{}}
        loading={false}
        isValid={true}
        isDuplicate={false}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    fireEvent.click(screen.getByTestId('select-change-empty'));
    expect(mockSetFieldValue).not.toHaveBeenCalledWith(
      'categoryId',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('displays validation error for name when present', () => {
    render(
      <ChangeSkillAdminModal
        type="Create"
        categories={mockCategories}
        open={true}
        formData={{ name: '', categoryId: '1' }}
        errors={{ name: 'skills.admin.error.required' }}
        loading={false}
        isValid={false}
        isDuplicate={false}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    expect(screen.getByText('Required error')).toBeDefined();
  });

  it('displays category error on SelectTrigger when present', () => {
    render(
      <ChangeSkillAdminModal
        type="Create"
        categories={mockCategories}
        open={true}
        formData={{ name: 'TypeScript', categoryId: '' }}
        errors={{ categoryId: 'skills.admin.error.required' }}
        loading={false}
        isValid={false}
        isDuplicate={false}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    expect(screen.getByTestId('select-trigger')).toHaveAttribute(
      'data-error',
      'Required error',
    );
  });

  it('displays duplicate name error and handles submission state correctly', () => {
    render(
      <ChangeSkillAdminModal
        type="Update"
        categories={mockCategories}
        open={true}
        formData={{ name: 'Python', categoryId: '1' }}
        errors={{}}
        loading={false}
        isValid={true}
        isDuplicate={true}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    expect(screen.getByText('Duplicate skill name')).toBeDefined();
    expect(screen.getByTestId('skill-input-field')).toHaveAttribute(
      'aria-invalid',
      'true',
    );

    const confirmBtn = screen.getByTestId('confirm-btn');
    expect(confirmBtn).not.toBeDisabled();

    fireEvent.click(confirmBtn);
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
