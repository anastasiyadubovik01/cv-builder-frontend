import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangePasswordForm } from './ChangePasswordForm';

const mockHandleChange = vi.fn();
const mockHandleBlur = vi.fn();
const mockHandleSubmit = vi.fn((e) => e.preventDefault());

const mockUseChangePasswordForm = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.password': 'Current Password',
        'settings.newPassword': 'New Password',
        'settings.confirmPassword': 'Confirm Password',
        'settings.change': 'Change Password',
        'errors.required': 'Field is required',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/features/settings/hooks/useChangePasswordForm', () => ({
  useChangePasswordForm: () => mockUseChangePasswordForm(),
}));

vi.mock('@/components/ui/password-input', () => ({
  PasswordInput: ({
    value,
    onChange,
    onBlur,
    error,
    placeholder,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
  }) => (
    <div>
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && <span data-testid={`error-${placeholder}`}>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    disabled,
    type,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    type?: 'submit' | 'button' | 'reset';
    onClick?: () => void;
  }) => (
    <button type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ChangePasswordForm', () => {
  const defaultFormReturn = {
    formData: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    errors: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    loading: false,
    isValid: true,
    handleChange: () => mockHandleChange,
    handleBlur: () => mockHandleBlur,
    handleSubmit: mockHandleSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChangePasswordForm.mockReturnValue(defaultFormReturn);
  });

  it('should render all password input fields and submit button correctly', () => {
    render(<ChangePasswordForm />);

    expect(screen.getByPlaceholderText('Current Password')).toBeDefined();
    expect(screen.getByPlaceholderText('New Password')).toBeDefined();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeDefined();

    const submitButton = screen.getByRole('button', {
      name: 'Change Password',
    });
    expect(submitButton).toBeDefined();
    expect((submitButton as HTMLButtonElement).disabled).toBe(false);
  });

  it('should disable submit button when form is invalid or loading', () => {
    mockUseChangePasswordForm.mockReturnValue({
      ...defaultFormReturn,
      isValid: false,
      loading: true,
    });

    render(<ChangePasswordForm />);

    const submitButton = screen.getByRole('button', {
      name: 'Change Password',
    });
    expect((submitButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('should display validation errors when present', () => {
    mockUseChangePasswordForm.mockReturnValue({
      ...defaultFormReturn,
      errors: {
        oldPassword: 'errors.required',
        newPassword: 'errors.required',
        confirmPassword: '',
      },
    });

    render(<ChangePasswordForm />);

    expect(screen.getByTestId('error-Current Password').textContent).toBe(
      'Field is required',
    );
    expect(screen.getByTestId('error-New Password').textContent).toBe(
      'Field is required',
    );
    expect(screen.queryByTestId('error-Confirm Password')).toBeNull();
  });

  it('should trigger handleSubmit when form is submitted', () => {
    render(<ChangePasswordForm />);

    const form = screen
      .getByRole('button', { name: 'Change Password' })
      .closest('form');
    expect(form).not.toBeNull();

    if (form) {
      fireEvent.submit(form);
    }

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});
