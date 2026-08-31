import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeUserModal } from './ChangeUserModal';
import React from 'react';

const mockHandleChange = vi.fn();
const mockSetFieldValue = vi.fn();
const mockValidateField = vi.fn();
const mockHandleSubmit = vi.fn().mockResolvedValue(true);

const defaultFormData = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  departmentId: '1',
  positionId: '1',
  role: 'Employee' as const,
};

const defaultProps = {
  type: 'Create' as const,
  open: true,
  onOpenChange: vi.fn(),
  authDisabled: false,
  formData: defaultFormData,
  errors: {},
  departments: [
    { id: '1', name: 'Engineering' },
    { id: '2', name: 'Marketing' },
  ],
  positions: [
    { id: '1', name: 'Developer' },
    { id: '2', name: 'Designer' },
  ],
  loading: false,
  isValid: true,
  handleChange: () => mockHandleChange,
  setFieldValue: mockSetFieldValue,
  validateField: mockValidateField,
  handleSubmit: mockHandleSubmit,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'users.roles.employee': 'Employee',
        'users.roles.admin': 'Admin',
        'users.create.email': 'Email',
        'users.create.password': 'Password',
        'users.create.firstName': 'First Name',
        'users.create.lastName': 'Last Name',
        'users.create.department': 'Department',
        'users.create.position': 'Position',
        'users.create.role': 'Role',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/components/dialogs/ChangeDialog', () => ({
  ChangeDialog: ({
    children,
    onConfirm,
    confirmDisabled,
    open,
  }: {
    children: React.ReactNode;
    onConfirm: () => void;
    confirmDisabled?: boolean;
    open?: boolean;
  }) =>
    open ? (
      <div data-testid="change-dialog">
        {children}
        <button
          data-testid="dialog-confirm-button"
          disabled={confirmDisabled}
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    disabled,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <input
        data-testid={`input-${placeholder}`}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      />
      {error && <span data-testid={`error-${placeholder}`}>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/password-input', () => ({
  PasswordInput: ({
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    disabled,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
  }) => (
    <div>
      <input
        type="password"
        data-testid={`password-input-${placeholder}`}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      />
      {error && <span data-testid={`error-${placeholder}`}>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
    onOpenChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (val: string) => void;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div data-testid="select-wrapper" data-value={value}>
      <button
        type="button"
        data-testid="select-open-toggle"
        onClick={() => onOpenChange?.(true)}
      >
        Open
      </button>
      <button
        type="button"
        data-testid="select-close-toggle"
        onClick={() => onOpenChange?.(false)}
      >
        Close
      </button>
      <button
        type="button"
        data-testid="select-change-val"
        onClick={() => onValueChange('2')}
      >
        ChangeValue
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    error,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode;
    error?: string;
    'aria-label'?: string;
  }) => (
    <div data-testid={`select-trigger-${ariaLabel}`}>
      <span>{children}</span>
      {error && <span data-testid={`error-${ariaLabel}`}>{error}</span>}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

describe('ChangeUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields correctly when open', () => {
    render(<ChangeUserModal {...defaultProps} />);

    expect(screen.getByTestId('change-dialog')).toBeDefined();
    expect(screen.getByTestId('input-Email')).toHaveValue('test@example.com');
    expect(screen.getByTestId('password-input-Password')).toHaveValue(
      'password123',
    );
    expect(screen.getByTestId('input-First Name')).toHaveValue('John');
    expect(screen.getByTestId('input-Last Name')).toHaveValue('Doe');
  });

  it('should mask password and disable auth fields when authDisabled is true', () => {
    render(<ChangeUserModal {...defaultProps} authDisabled={true} />);

    expect(screen.getByTestId('input-Email')).toBeDisabled();
    expect(screen.getByTestId('password-input-Password')).toBeDisabled();
    expect(screen.getByTestId('password-input-Password')).toHaveValue(
      '************',
    );
  });

  it('should display error messages for fields when errors are present', () => {
    const errors = {
      email: 'users.validation.email.invalid',
      password: 'users.validation.password.required',
      lastName: 'users.validation.lastName.required',
      firstName: 'users.validation.firstName.required',
      departmentId: 'users.validation.department.required',
      positionId: 'users.validation.position.required',
      role: 'users.validation.role.required',
    };

    render(<ChangeUserModal {...defaultProps} errors={errors} />);

    expect(screen.getByTestId('error-Email')).toHaveTextContent(
      'users.validation.email.invalid',
    );
    expect(screen.getByTestId('error-Password')).toHaveTextContent(
      'users.validation.password.required',
    );
    expect(screen.getByTestId('error-Last Name')).toHaveTextContent(
      'users.validation.lastName.required',
    );
    expect(screen.getByTestId('error-First Name')).toHaveTextContent(
      'users.validation.firstName.required',
    );
    expect(screen.getByTestId('error-Department')).toHaveTextContent(
      'users.validation.department.required',
    );
    expect(screen.getByTestId('error-Position')).toHaveTextContent(
      'users.validation.position.required',
    );
    expect(screen.getByTestId('error-Role')).toHaveTextContent(
      'users.validation.role.required',
    );
  });

  it('should trigger field validation on blur for text inputs including email, password, firstName, and lastName', () => {
    render(<ChangeUserModal {...defaultProps} />);

    fireEvent.blur(screen.getByTestId('input-Email'));
    expect(mockValidateField).toHaveBeenCalledWith('email');

    fireEvent.blur(screen.getByTestId('password-input-Password'));
    expect(mockValidateField).toHaveBeenCalledWith('password');

    fireEvent.blur(screen.getByTestId('input-First Name'));
    expect(mockValidateField).toHaveBeenCalledWith('firstName');

    fireEvent.blur(screen.getByTestId('input-Last Name'));
    expect(mockValidateField).toHaveBeenCalledWith('lastName');
  });

  it('should trigger field validation on select close event for position and role', () => {
    render(<ChangeUserModal {...defaultProps} />);

    const closeButtons = screen.getAllByTestId('select-close-toggle');
    // Index 0: Department, Index 1: Position, Index 2: Role
    fireEvent.click(closeButtons[1]);
    expect(mockValidateField).toHaveBeenCalledWith('positionId');

    fireEvent.click(closeButtons[2]);
    expect(mockValidateField).toHaveBeenCalledWith('role');
  });

  it('should update field value when position or role select value changes', () => {
    render(<ChangeUserModal {...defaultProps} />);

    const changeValueButtons = screen.getAllByTestId('select-change-val');
    // Index 1: Position, Index 2: Role
    fireEvent.click(changeValueButtons[1]);
    expect(mockSetFieldValue).toHaveBeenCalledWith('positionId', '2', {
      shouldValidate: true,
    });

    fireEvent.click(changeValueButtons[2]);
    expect(mockSetFieldValue).toHaveBeenCalledWith('role', '2', {
      shouldValidate: true,
    });
  });

  it('should trigger field validation on select close event', () => {
    render(<ChangeUserModal {...defaultProps} />);

    const closeButton = screen.getAllByTestId('select-close-toggle')[0];
    fireEvent.click(closeButton);

    expect(mockValidateField).toHaveBeenCalledWith('departmentId');
  });

  it('should update field value when select value changes', () => {
    render(<ChangeUserModal {...defaultProps} />);

    const changeValueBtn = screen.getAllByTestId('select-change-val')[0];
    fireEvent.click(changeValueBtn);

    expect(mockSetFieldValue).toHaveBeenCalledWith('departmentId', '2', {
      shouldValidate: true,
    });
  });

  it('should disable confirm button when form is invalid', () => {
    render(<ChangeUserModal {...defaultProps} isValid={false} />);

    const confirmButton = screen.getByTestId('dialog-confirm-button');
    expect(confirmButton).toBeDisabled();
  });

  it('should disable confirm button when loading is true', () => {
    render(<ChangeUserModal {...defaultProps} loading={true} />);

    const confirmButton = screen.getByTestId('dialog-confirm-button');
    expect(confirmButton).toBeDisabled();
  });

  it('should call handleSubmit when confirm button is clicked', async () => {
    render(<ChangeUserModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('dialog-confirm-button');
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  it('should not render anything when open is false', () => {
    render(<ChangeUserModal {...defaultProps} open={false} />);

    expect(screen.queryByTestId('change-dialog')).toBeNull();
  });
});
