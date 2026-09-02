import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateCvForm } from '@/features/cvs/hooks/useCreateCvForm';
import { ChangeCvModal } from './ChangeCvModal';

import { CreateCvModal } from './CreateCvModal';

vi.mock('@/features/cvs/hooks/useCreateCvForm', () => ({
  useCreateCvForm: vi.fn(),
}));

vi.mock('./ChangeCvModal', () => ({
  ChangeCvModal: vi.fn(
    ({ type, trigger }: { type: string; trigger?: ReactNode }) => (
      <div data-testid="change-cv-modal" data-type={type}>
        {trigger}
      </div>
    ),
  ),
}));

describe('CreateCvModal', () => {
  const onSuccess = vi.fn();

  const form = {
    formData: {
      name: '',
      education: '',
      description: '',
    },
    errors: {},
    loading: false,
    isValid: true,
    handleChange: vi.fn(),
    validateField: vi.fn(),
    handleSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCreateCvForm).mockReturnValue(form as never);
  });

  it('creates form with userId and onSuccess', () => {
    render(<CreateCvModal userId="user-1" onSuccess={onSuccess} />);

    expect(useCreateCvForm).toHaveBeenCalledWith({
      userId: 'user-1',
      onSuccess,
    });
  });

  it('passes create form to ChangeCvModal', () => {
    render(<CreateCvModal userId="user-1" onSuccess={onSuccess} />);

    expect(ChangeCvModal).toHaveBeenCalledWith(
      expect.objectContaining({
        ...form,
        type: 'Create',
      }),
      undefined,
    );
  });

  it('passes trigger to ChangeCvModal', () => {
    render(<CreateCvModal trigger={<button>Open CV modal</button>} />);

    expect(
      screen.getByRole('button', {
        name: 'Open CV modal',
      }),
    ).toBeInTheDocument();

    expect(ChangeCvModal).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.anything(),
        type: 'Create',
      }),
      undefined,
    );
  });

  it('works without optional userId and onSuccess', () => {
    render(<CreateCvModal />);

    expect(useCreateCvForm).toHaveBeenCalledWith({
      userId: undefined,
      onSuccess: undefined,
    });

    expect(screen.getByTestId('change-cv-modal')).toHaveAttribute(
      'data-type',
      'Create',
    );
  });
});
