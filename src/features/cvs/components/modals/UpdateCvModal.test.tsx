import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateCvForm } from '@/features/cvs/hooks/useUpdateCvForm';
import type { CreateCvFormValues } from '@/lib/validations/cv';

import { ChangeCvModal } from './ChangeCvModal';
import { UpdateCvModal } from './UpdateCvModal';

vi.mock('@/features/cvs/hooks/useUpdateCvForm', () => ({
  useUpdateCvForm: vi.fn(),
}));

vi.mock('./ChangeCvModal', () => ({
  ChangeCvModal: vi.fn(({ type, open }: { type: string; open?: boolean }) => (
    <div
      data-testid="change-cv-modal"
      data-type={type}
      data-open={String(open)}
    />
  )),
}));

describe('UpdateCvModal', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  const initialValues: CreateCvFormValues = {
    name: 'Frontend CV',
    education: 'BSU',
    description: 'Frontend Developer',
  };

  const form = {
    formData: initialValues,
    errors: {},
    loading: false,
    isValid: true,
    handleChange: vi.fn(),
    validateField: vi.fn(),
    handleSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUpdateCvForm).mockReturnValue(form as never);
  });

  it('configures update form', () => {
    render(
      <UpdateCvModal
        cvId="cv-1"
        initialValues={initialValues}
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );

    expect(useUpdateCvForm).toHaveBeenCalledWith({
      cvId: 'cv-1',
      initialValues,
      onSuccess,
    });
  });

  it('passes form data to ChangeCvModal', () => {
    render(
      <UpdateCvModal
        cvId="cv-1"
        initialValues={initialValues}
        open
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );

    expect(ChangeCvModal).toHaveBeenCalledWith(
      expect.objectContaining({
        ...form,
        type: 'Update',
        open: true,
        onOpenChange,
      }),
      undefined,
    );
  });

  it('passes closed state to ChangeCvModal', () => {
    render(
      <UpdateCvModal
        cvId="cv-1"
        initialValues={initialValues}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByTestId('change-cv-modal')).toHaveAttribute(
      'data-open',
      'false',
    );
  });

  it('uses Update type', () => {
    render(
      <UpdateCvModal
        cvId="cv-1"
        initialValues={initialValues}
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(screen.getByTestId('change-cv-modal')).toHaveAttribute(
      'data-type',
      'Update',
    );
  });

  it('works without optional onSuccess', () => {
    render(
      <UpdateCvModal
        cvId="cv-1"
        initialValues={initialValues}
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(useUpdateCvForm).toHaveBeenCalledWith({
      cvId: 'cv-1',
      initialValues,
      onSuccess: undefined,
    });
  });
});
