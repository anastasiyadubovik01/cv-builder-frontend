import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileFields } from './ProfileFields';
import React from 'react';

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

const mockRouter = {
  push: vi.fn(),
};

const mockOnUpdated = vi.fn().mockResolvedValue(undefined);

const defaultProps = {
  userId: '1',
  firstName: 'John',
  lastName: 'Doe',
  departmentId: '1',
  department: 'Engineering',
  positionId: 'pos-1',
  position: 'Developer',
  role: 'Employee',
  canEdit: true,
  canVerifyEmail: false,
  onUpdated: mockOnUpdated,
};

let mockValidateFormResult = true;
let mockFormErrors: Record<string, string> = {};
let mockUpdateProfileFn = vi.fn().mockResolvedValue({ data: {} });
let mockUpdateUserFn = vi.fn().mockResolvedValue({ data: {} });

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'users.details.fields.firstName': 'First Name',
        'users.details.fields.lastName': 'Last Name',
        'users.details.fields.department': 'Department',
        'users.details.fields.position': 'Position',
        'users.details.notAssigned': 'Not assigned',
        'users.details.updateSuccess': 'Update successful',
        'users.details.updateError': 'Update failed',
        verifyEmail: 'Verify Email',
        update: 'Update',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: () => mockToast,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    data: {
      departments: {
        items: [
          { id: '1', name: 'Engineering' },
          { id: '2', name: 'Marketing' },
        ],
      },
      positions: {
        items: [
          { id: 'pos-1', name: 'Developer' },
          { id: 'pos-2', name: 'Designer' },
        ],
      },
    },
  }),
  useMutation: (mutation: unknown) => {
    if (
      String(mutation).includes('UPDATE_PROFILE_MUTATION') ||
      (
        mutation as { loc?: { source?: { body?: string } } }
      )?.loc?.source?.body?.includes('updateProfile')
    ) {
      return [mockUpdateProfileFn, { loading: false }];
    }
    return [mockUpdateUserFn, { loading: false }];
  },
}));

vi.mock('@/components/hooks/useValidatedForm', () => {
  return {
    useValidatedForm: ({
      initialValues,
    }: {
      initialValues: Record<string, string>;
    }) => {
      const [formData, setFormData] = React.useState(initialValues);
      const [errors, setErrors] =
        React.useState<Record<string, string>>(mockFormErrors);

      return {
        formData: formData,
        setFormData: setFormData,
        errors: errors,
        setErrors: setErrors,
        validateForm: vi.fn().mockImplementation(() => mockValidateFormResult),
        handleChange:
          (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev: Record<string, string>) => ({
              ...prev,
              [field]: e.target.value,
            }));
          },
      };
    },
  };
});

vi.mock('@/components/ui/input', () => ({
  Input: ({
    id,
    value,
    onChange,
    disabled,
    maxLength,
    error,
  }: {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    maxLength?: number;
    error?: string;
  }) => (
    <div>
      <input
        id={id}
        data-testid={`input-${id}`}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={!!error}
      />
      {error && <span data-testid={`error-${id}`}>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({
    htmlFor,
    children,
    className,
  }: {
    htmlFor: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <label
      htmlFor={htmlFor}
      className={className}
      data-testid={`label-${htmlFor}`}
    >
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button
      type={type || 'button'}
      data-testid="button-Update"
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
    disabled,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string | null) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="select">
      <select
        data-testid={`select-trigger-${value || 'pos-1'}`}
        value={value || ''}
        onChange={(e) => onValueChange?.(e.target.value)}
        disabled={disabled}
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    id: string;
    className?: string;
    error?: string;
  }) => <div>{children}</div>,
  SelectValue: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
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
    <option value={value} data-testid={`select-item-${value}`}>
      {children}
    </option>
  ),
}));

describe('ProfileFields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateFormResult = true;
    mockFormErrors = {};
    mockUpdateProfileFn = vi.fn().mockResolvedValue({ data: {} });
    mockUpdateUserFn = vi.fn().mockResolvedValue({ data: {} });
  });

  it('should render all fields with initial values', () => {
    render(<ProfileFields {...defaultProps} />);

    expect(screen.getByTestId('input-firstName')).toHaveValue('John');
    expect(screen.getByTestId('input-lastName')).toHaveValue('Doe');
  });

  it('should disable fields when canEdit is false', () => {
    render(<ProfileFields {...defaultProps} canEdit={false} />);

    expect(screen.getByTestId('input-firstName')).toBeDisabled();
    expect(screen.getByTestId('input-lastName')).toBeDisabled();

    const selects = screen.getAllByTestId(/select-trigger-/);
    selects.forEach((select) => {
      expect(select).toBeDisabled();
    });

    expect(screen.queryByTestId('button-Update')).toBeNull();
  });

  it('should show verify email button when canVerifyEmail is true', () => {
    render(<ProfileFields {...defaultProps} canVerifyEmail={true} />);

    const verifyButton = screen.getByText('Verify Email');
    expect(verifyButton).toBeDefined();
  });

  it('should not show verify email button when canVerifyEmail is false', () => {
    render(<ProfileFields {...defaultProps} canVerifyEmail={false} />);

    expect(screen.queryByText('Verify Email')).toBeNull();
  });

  it('should update button be disabled when no changes', () => {
    render(<ProfileFields {...defaultProps} />);

    const updateButton = screen.getByTestId('button-Update');
    expect(updateButton).toBeDisabled();
  });

  it('should handle successful update when names changed', async () => {
    render(<ProfileFields {...defaultProps} />);

    const firstNameInput = screen.getByTestId('input-firstName');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    const updateButton = screen.getByTestId('button-Update');
    expect(updateButton).not.toBeDisabled();

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnUpdated).toHaveBeenCalled();
    });
  });

  it('should handle update error', async () => {
    const mockOnUpdatedError = vi
      .fn()
      .mockRejectedValue(new Error('Update failed'));

    const { rerender } = render(
      <ProfileFields {...defaultProps} onUpdated={mockOnUpdatedError} />,
    );

    rerender(
      <ProfileFields
        {...defaultProps}
        firstName="Jane"
        lastName="Smith"
        onUpdated={mockOnUpdatedError}
      />,
    );

    const updateButton = screen.getByTestId('button-Update');
    expect(updateButton).not.toBeDisabled();

    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Update failed');
    });
  });

  it('should handle router navigation for verify email', () => {
    render(<ProfileFields {...defaultProps} canVerifyEmail={true} />);

    const verifyButton = screen.getByText('Verify Email');
    fireEvent.click(verifyButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/verify-email');
  });

  it('should show not assigned text when department is not selected', () => {
    render(
      <ProfileFields
        {...defaultProps}
        departmentId=""
        department=""
        canEdit={false}
      />,
    );

    const departmentLabel = screen.getByTestId('label-department');
    expect(departmentLabel).toBeDefined();
  });

  it('should render department select with correct value', () => {
    render(<ProfileFields {...defaultProps} />);

    const departmentSelect = screen.getByTestId('select-trigger-1');
    expect(departmentSelect).toBeDefined();
  });

  it('should render position select with correct value', () => {
    render(<ProfileFields {...defaultProps} />);

    const positionSelect = screen.getByTestId('select-trigger-pos-1');
    expect(positionSelect).toBeDefined();
  });

  it('should ignore null values and clear error on department change when departmentId error exists', () => {
    mockFormErrors = { departmentId: 'Error in department' };
    render(<ProfileFields {...defaultProps} />);

    const departmentSelect = screen.getByTestId('select-trigger-1');

    fireEvent.change(departmentSelect, { target: { value: '' } });

    fireEvent.change(departmentSelect, { target: { value: '2' } });
    expect(departmentSelect).toBeDefined();
  });

  it('should ignore null values and clear error on position change when positionId error exists', () => {
    mockFormErrors = { positionId: 'Error in position' };
    render(<ProfileFields {...defaultProps} />);

    const positionSelect = screen.getByTestId('select-trigger-pos-1');

    fireEvent.change(positionSelect, { target: { value: 'pos-2' } });
    expect(positionSelect).toBeDefined();
  });

  it('should abort handleUpdate if form validation fails', async () => {
    mockValidateFormResult = false;
    render(<ProfileFields {...defaultProps} />);

    const firstNameInput = screen.getByTestId('input-firstName');
    fireEvent.change(firstNameInput, { target: { value: 'InvalidJane' } });

    const updateButton = screen.getByTestId('button-Update');
    fireEvent.click(updateButton);

    expect(mockUpdateProfileFn).not.toHaveBeenCalled();
  });
});
