import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UpdateUserModal } from './UpdateUserModal';
import React from 'react';

const mockUseQuery = vi.fn();
const mockUseUpdateUserForm = vi.fn().mockReturnValue({
  formData: {},
  errors: {},
  departments: [],
  positions: [],
  loading: false,
  isValid: true,
  handleChange: vi.fn(),
  setFieldValue: vi.fn(),
  validateField: vi.fn(),
  handleSubmit: vi.fn(),
});

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock('@/features/users/hooks/useUpdateUserForm', () => ({
  useUpdateUserForm: (props: unknown) => mockUseUpdateUserForm(props),
}));

vi.mock('@/features/users/components/modals/ChangeUserModal', () => ({
  ChangeUserModal: ({
    type,
    open,
    authDisabled,
  }: {
    type: string;
    open: boolean;
    authDisabled: boolean;
  }) =>
    open ? (
      <div data-testid="change-modal">
        <span data-testid="modal-type">{type}</span>
        <span data-testid="auth-disabled">{String(authDisabled)}</span>
      </div>
    ) : null,
}));

describe('UpdateUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when user query data is not available or user is missing', () => {
    mockUseQuery.mockReturnValue({ data: null });

    const { container } = render(
      <UpdateUserModal userId="1" open={true} onOpenChange={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { userId: '1' },
        skip: false,
      }),
    );
  });

  it('should skip query execution when modal is closed', () => {
    mockUseQuery.mockReturnValue({ data: null });

    render(<UpdateUserModal userId="1" open={false} onOpenChange={vi.fn()} />);

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { userId: '1' },
        skip: true,
      }),
    );
  });

  it('should render UpdateUserForm wrapped in ChangeUserModal when user data exists', () => {
    const mockUser = {
      id: '1',
      email: 'john.doe@example.com',
      role: 'Admin',
      profile: {
        first_name: 'John',
        last_name: 'Doe',
      },
      department: { id: '1', name: 'Engineering' },
      position: { id: '1', name: 'Lead' },
    };

    mockUseQuery.mockReturnValue({ data: { user: mockUser } });

    const onSuccess = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <UpdateUserModal
        userId="1"
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );

    expect(mockUseUpdateUserForm).toHaveBeenCalledWith({
      userId: '1',
      initialValues: {
        email: 'john.doe@example.com',
        password: '',
        firstName: 'John',
        lastName: 'Doe',
        departmentId: '1',
        positionId: '1',
        role: 'Admin',
      },
      onSuccess,
    });

    expect(screen.getByTestId('change-modal')).toBeDefined();
    expect(screen.getByTestId('modal-type')).toHaveTextContent('Update');
    expect(screen.getByTestId('auth-disabled')).toHaveTextContent('true');
  });

  it('should handle optional profile fields and department/position gracefully when they are null', () => {
    const mockUserWithNulls = {
      id: '2',
      email: 'jane.smith@example.com',
      role: 'Employee',
      profile: {
        first_name: null,
        last_name: null,
      },
      department: null,
      position: null,
    };

    mockUseQuery.mockReturnValue({ data: { user: mockUserWithNulls } });

    render(<UpdateUserModal userId="2" open={true} onOpenChange={vi.fn()} />);

    expect(mockUseUpdateUserForm).toHaveBeenCalledWith({
      userId: '2',
      initialValues: {
        email: 'jane.smith@example.com',
        password: '',
        firstName: '',
        lastName: '',
        departmentId: '',
        positionId: '',
        role: 'Employee',
      },
      onSuccess: undefined,
    });
  });
});
