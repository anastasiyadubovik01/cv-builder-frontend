import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreatePositionModal } from './CreatePositionModal';
import React from 'react';

const mockUseCreatePositionForm = vi.fn();

vi.mock('../../hooks/useCreatePositionForm', () => ({
  useCreatePositionForm: (options: unknown) =>
    mockUseCreatePositionForm(options),
}));

vi.mock('./ChangePositionModal', () => ({
  ChangePositionModal: (props: unknown) => {
    const typedProps = props as {
      type: string;
      trigger?: React.ReactNode;
      formData: { name: string };
    };
    return (
      <div
        data-testid="change-position-modal"
        data-type={typedProps.type}
        data-form-name={typedProps.formData.name}
      >
        {typedProps.trigger}
      </div>
    );
  },
}));

describe('CreatePositionModal', () => {
  const mockPositions = [
    {
      id: '1',
      name: 'Existing Position',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreatePositionForm.mockReturnValue({
      formData: { name: '' },
      errors: {},
      loading: false,
      duplicateName: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    });
  });

  it('calls useCreatePositionForm with positions and onSuccess, and passes props to ChangePositionModal', () => {
    render(
      <CreatePositionModal
        positions={mockPositions}
        trigger={<button data-testid="custom-trigger">Create</button>}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseCreatePositionForm).toHaveBeenCalledWith({
      positions: mockPositions,
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-position-modal');
    expect(modal).toHaveAttribute('data-type', 'Create');
    expect(screen.getByTestId('custom-trigger')).toBeDefined();
  });
});
