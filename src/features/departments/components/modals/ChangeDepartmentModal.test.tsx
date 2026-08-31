import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeDepartmentModal } from './ChangeDepartmentModal';
import React from 'react';

const mockChangeDialog = vi.fn();
const mockInput = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'departments.name': 'Department Name',
        'departments.validation.duplicateName':
          'Duplicate department name error',
        'custom.error': 'Custom department validation error',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('@/components/dialogs/ChangeDialog', () => ({
  ChangeDialog: (props: unknown) => {
    mockChangeDialog(props);
    const typedProps = props as {
      actionTitle: string;
      itemType: string;
      onConfirm: () => Promise<boolean>;
      confirmDisabled: boolean;
      trigger?: React.ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      children: React.ReactNode;
    };
    return (
      <div
        data-testid="change-dialog"
        data-action-title={typedProps.actionTitle}
        data-item-type={typedProps.itemType}
        data-confirm-disabled={String(typedProps.confirmDisabled)}
        data-open={String(typedProps.open)}
      >
        {typedProps.trigger}
        <button
          data-testid="dialog-confirm-btn"
          onClick={() => void typedProps.onConfirm()}
        >
          Confirm
        </button>
        {typedProps.onOpenChange && (
          <button
            data-testid="dialog-toggle-btn"
            onClick={() => typedProps.onOpenChange?.(false)}
          >
            Toggle Close
          </button>
        )}
        <div data-testid="dialog-content">{typedProps.children}</div>
      </div>
    );
  },
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: unknown) => {
    mockInput(props);
    const typedProps = props as {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      placeholder: string;
      required: boolean;
      error?: string;
    };
    return (
      <input
        data-testid="department-name-input"
        value={typedProps.value}
        onChange={typedProps.onChange}
        placeholder={typedProps.placeholder}
        required={typedProps.required}
        data-error={typedProps.error}
      />
    );
  },
}));

describe('ChangeDepartmentModal', () => {
  const mockHandleChange = vi.fn().mockReturnValue(vi.fn());
  const mockHandleSubmit = vi.fn().mockResolvedValue(true);
  const mockOnOpenChange = vi.fn();

  const defaultProps = {
    type: 'Create' as const,
    trigger: <button data-testid="trigger-btn">Open Modal</button>,
    open: true,
    onOpenChange: mockOnOpenChange,
    formData: { name: 'Engineering' },
    errors: {},
    loading: false,
    duplicateName: false,
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props and handles input changes and submission', async () => {
    render(<ChangeDepartmentModal {...defaultProps} />);

    const dialog = screen.getByTestId('change-dialog');
    expect(dialog).toHaveAttribute('data-action-title', 'Create');
    expect(dialog).toHaveAttribute('data-item-type', 'department');
    expect(dialog).toHaveAttribute('data-confirm-disabled', 'false');
    expect(dialog).toHaveAttribute('data-open', 'true');

    expect(screen.getByTestId('trigger-btn')).toBeDefined();

    const input = screen.getByTestId('department-name-input');
    expect(input).toHaveValue('Engineering');
    expect(input).toHaveAttribute('placeholder', 'Department Name');
    expect(input).toHaveAttribute('required');

    fireEvent.change(input, { target: { value: 'HR' } });
    expect(mockHandleChange).toHaveBeenCalledWith('name');

    fireEvent.click(screen.getByTestId('dialog-confirm-btn'));
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId('dialog-toggle-btn'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('displays duplicate name error when duplicateName is true', () => {
    render(<ChangeDepartmentModal {...defaultProps} duplicateName={true} />);

    const input = screen.getByTestId('department-name-input');
    expect(input).toHaveAttribute(
      'data-error',
      'Duplicate department name error',
    );
  });

  it('displays field error from errors object over duplicateName', () => {
    render(
      <ChangeDepartmentModal
        {...defaultProps}
        errors={{ name: 'custom.error' }}
        duplicateName={true}
      />,
    );

    const input = screen.getByTestId('department-name-input');
    expect(input).toHaveAttribute(
      'data-error',
      'Custom department validation error',
    );
  });

  it('disables confirmation when loading is true', () => {
    render(<ChangeDepartmentModal {...defaultProps} loading={true} />);

    const dialog = screen.getByTestId('change-dialog');
    expect(dialog).toHaveAttribute('data-confirm-disabled', 'true');
  });
});
