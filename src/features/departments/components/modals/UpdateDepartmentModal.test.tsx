import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UpdateDepartmentModal } from './UpdateDepartmentModal';
import React from 'react';

const mockUseUpdateDepartmentForm = vi.fn();

vi.mock('../../hooks/useUpdateDepartmentForm', () => ({
  useUpdateDepartmentForm: (options: unknown) =>
    mockUseUpdateDepartmentForm(options),
}));

vi.mock('./ChangeDepartmentModal', () => ({
  ChangeDepartmentModal: (props: unknown) => {
    const typedProps = props as {
      type: string;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      formData: { name: string };
    };
    return (
      <div
        data-testid="change-department-modal"
        data-type={typedProps.type}
        data-open={String(typedProps.open)}
        data-form-name={typedProps.formData.name}
      />
    );
  },
}));

describe('UpdateDepartmentModal', () => {
  const mockDepartment = {
    id: '1',
    name: 'Engineering',
    created_at: '2026-01-01T00:00:00.000Z',
  };
  const mockDepartments = [mockDepartment];
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateDepartmentForm.mockReturnValue({
      formData: { name: 'Engineering' },
      errors: {},
      loading: false,
      duplicateName: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    });
  });

  it('calls useUpdateDepartmentForm with department, departments and onSuccess, and passes props to ChangeDepartmentModal', () => {
    render(
      <UpdateDepartmentModal
        department={mockDepartment}
        departments={mockDepartments}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseUpdateDepartmentForm).toHaveBeenCalledWith({
      department: mockDepartment,
      departments: mockDepartments,
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-department-modal');
    expect(modal).toHaveAttribute('data-type', 'Update');
    expect(modal).toHaveAttribute('data-open', 'true');
    expect(modal).toHaveAttribute('data-form-name', 'Engineering');
  });
});
