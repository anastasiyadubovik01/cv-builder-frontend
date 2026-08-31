import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateUserModal } from './CreateUserModal';
import React from 'react';

const mockFormValues = {
  formData: { email: '' },
  errors: {},
  departments: [],
  positions: [],
  loading: false,
  isValid: false,
  handleChange: vi.fn(),
  setFieldValue: vi.fn(),
  validateField: vi.fn(),
  handleSubmit: vi.fn(),
};

const mockUseCreateUserForm = vi.fn().mockReturnValue(mockFormValues);

vi.mock('@/features/users/hooks/useCreateUserForm', () => ({
  useCreateUserForm: (props: unknown) => mockUseCreateUserForm(props),
}));

vi.mock('@/features/users/components/modals/ChangeUserModal', () => ({
  ChangeUserModal: ({
    type,
    trigger,
  }: {
    type: string;
    trigger: React.ReactNode;
  }) => (
    <div data-testid="change-user-modal">
      <span data-testid="modal-type">{type}</span>
      <div data-testid="modal-trigger">{trigger}</div>
    </div>
  ),
}));

describe('CreateUserModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass options and render ChangeUserModal with type Create', () => {
    const onSuccess = vi.fn();
    const triggerElement = <button data-testid="custom-trigger">Open</button>;

    render(<CreateUserModal trigger={triggerElement} onSuccess={onSuccess} />);

    expect(mockUseCreateUserForm).toHaveBeenCalledWith({ onSuccess });
    expect(screen.getByTestId('change-user-modal')).toBeDefined();
    expect(screen.getByTestId('modal-type')).toHaveTextContent('Create');
    expect(screen.getByTestId('custom-trigger')).toBeDefined();
  });
});
