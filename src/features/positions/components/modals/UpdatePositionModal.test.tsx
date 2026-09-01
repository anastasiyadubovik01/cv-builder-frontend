import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UpdatePositionModal } from './UpdatePositionModal';
import React from 'react';

const mockUseUpdatePositionForm = vi.fn();

vi.mock('../../hooks/useUpdatePositionForm', () => ({
  useUpdatePositionForm: (options: unknown) =>
    mockUseUpdatePositionForm(options),
}));

vi.mock('./ChangePositionModal', () => ({
  ChangePositionModal: (props: unknown) => {
    const typedProps = props as {
      type: string;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
      formData: { name: string };
    };
    return (
      <div
        data-testid="change-position-modal"
        data-type={typedProps.type}
        data-open={String(typedProps.open)}
        data-form-name={typedProps.formData.name}
      />
    );
  },
}));

describe('UpdatePositionModal', () => {
  const mockPosition = {
    id: '1',
    name: 'Software Engineer',
    created_at: '2026-01-01T00:00:00.000Z',
  };
  const mockPositions = [mockPosition];
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdatePositionForm.mockReturnValue({
      formData: { name: 'Software Engineer' },
      errors: {},
      loading: false,
      duplicateName: false,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(),
    });
  });

  it('calls useUpdatePositionForm with position, positions and onSuccess, and passes props to ChangePositionModal', () => {
    render(
      <UpdatePositionModal
        position={mockPosition}
        positions={mockPositions}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseUpdatePositionForm).toHaveBeenCalledWith({
      position: mockPosition,
      positions: mockPositions,
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-position-modal');
    expect(modal).toHaveAttribute('data-type', 'Update');
    expect(modal).toHaveAttribute('data-open', 'true');
    expect(modal).toHaveAttribute('data-form-name', 'Software Engineer');
  });
});
