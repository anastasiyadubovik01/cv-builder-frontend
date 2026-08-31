import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateDepartmentModal } from './CreateDepartmentModal';
import React from 'react';

const mockUseCreateDepartmentForm = vi.fn();

vi.mock('../../hooks/useCreateDepartmentForm', () => ({
  useCreateDepartmentForm: (options: unknown) =>
    mockUseCreateDepartmentForm(options),
}));

vi.mock('./ChangeDepartmentModal', () => ({
  ChangeDepartmentModal: (props: unknown) => {
    const typedProps = props as {
      type: string;
      trigger?: React.ReactNode;
      formData: { name: string };
    };
    return (
      <div
        data-testid="change-department-modal"
        data-type={typedProps.type}
        data-form-name={typedProps.formData.name}
      >
        {typedProps.trigger}
      </div>
    );
  },
}));

describe('CreateDepartmentModal', () => {
  const mockDepartments = [
    { id: '1', name: 'Existing Dept', created_at: '2026-01-01T00:00:00.000Z' },
  ];
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateDepartmentForm.mockReturnValue({
      formData: { name: '' },
      errors: {},
      loading: false,
      duplicateName: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    });
  });

  it('calls useCreateDepartmentForm with departments and onSuccess, and passes props to ChangeDepartmentModal', () => {
    render(
      <CreateDepartmentModal
        departments={mockDepartments}
        trigger={<button data-testid="custom-trigger">Create</button>}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseCreateDepartmentForm).toHaveBeenCalledWith({
      departments: mockDepartments,
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-department-modal');
    expect(modal).toHaveAttribute('data-type', 'Create');
    expect(screen.getByTestId('custom-trigger')).toBeDefined();
  });
});
