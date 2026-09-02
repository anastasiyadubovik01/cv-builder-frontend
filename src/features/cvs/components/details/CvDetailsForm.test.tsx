import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateCvForm } from '@/features/cvs/hooks/useUpdateCvForm';

import { CvDetailsForm } from './CvDetailsForm';

vi.mock('@/features/cvs/hooks/useUpdateCvForm', () => ({
  useUpdateCvForm: vi.fn(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    error,
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & {
    error?: string;
  }) => (
    <div>
      <input {...props} />
      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({
    error,
    ...props
  }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: string;
  }) => (
    <div>
      <textarea {...props} />
      {error && <span>{error}</span>}
    </div>
  ),
}));

describe('CvDetailsForm', () => {
  const validateField = vi.fn();
  const handleSubmit = vi.fn();
  const onUpdated = vi.fn();

  const nameChange = vi.fn();
  const educationChange = vi.fn();
  const descriptionChange = vi.fn();

  const handleChange = vi.fn((field: string) => {
    if (field === 'name') return nameChange;
    if (field === 'education') return educationChange;
    return descriptionChange;
  });

  const t = vi.fn((key: string) => key);

  const mockHook = ({
    formData = {
      name: 'Frontend CV',
      education: 'BSU',
      description: 'Developer',
    },
    errors = {},
    loading = false,
    isValid = true,
  } = {}) => {
    vi.mocked(useUpdateCvForm).mockReturnValue({
      formData,
      errors,
      loading,
      isValid,
      validateField,
      handleChange,
      handleSubmit,
      t,
    } as never);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    handleSubmit.mockResolvedValue(true);

    mockHook();
  });

  it('configures update CV form', () => {
    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(useUpdateCvForm).toHaveBeenCalledWith(
      expect.objectContaining({
        cvId: 'cv-1',
        initialValues: {
          name: 'Frontend CV',
          education: 'BSU',
          description: 'Developer',
        },
        onSuccess: expect.any(Function),
      }),
    );
  });

  it('renders form values', () => {
    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByDisplayValue('Frontend CV')).toBeInTheDocument();
    expect(screen.getByDisplayValue('BSU')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Developer')).toBeInTheDocument();
  });

  it('validates fields on blur', () => {
    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    fireEvent.blur(screen.getByDisplayValue('Frontend CV'));
    fireEvent.blur(screen.getByDisplayValue('BSU'));
    fireEvent.blur(screen.getByDisplayValue('Developer'));

    expect(validateField).toHaveBeenCalledWith('name');
    expect(validateField).toHaveBeenCalledWith('education');
    expect(validateField).toHaveBeenCalledWith('description');
  });

  it('does not show update button when user cannot edit', () => {
    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit={false}
        onUpdated={onUpdated}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'update' }),
    ).not.toBeInTheDocument();

    expect(screen.getByDisplayValue('Frontend CV')).toBeDisabled();
    expect(screen.getByDisplayValue('BSU')).toBeDisabled();
    expect(screen.getByDisplayValue('Developer')).toBeDisabled();
  });

  it('disables update when form was not changed', () => {
    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByRole('button', { name: 'update' })).toBeDisabled();
  });

  it('ignores whitespace-only changes', () => {
    mockHook({
      formData: {
        name: '  Frontend CV  ',
        education: ' BSU ',
        description: ' Developer ',
      },
    });

    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByRole('button', { name: 'update' })).toBeDisabled();
  });

  it('enables update when data changed and form is valid', () => {
    mockHook({
      formData: {
        name: 'Updated CV',
        education: 'BSU',
        description: 'Developer',
      },
    });

    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByRole('button', { name: 'update' })).toBeEnabled();
  });

  it('submits changed valid form', async () => {
    mockHook({
      formData: {
        name: 'Updated CV',
        education: 'BSU',
        description: 'Developer',
      },
    });

    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'update' }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables update when form is invalid', () => {
    mockHook({
      formData: {
        name: 'Updated CV',
        education: 'BSU',
        description: 'Developer',
      },
      isValid: false,
    });

    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByRole('button', { name: 'update' })).toBeDisabled();
  });

  it('disables fields and update button while updating', () => {
    mockHook({
      formData: {
        name: 'Updated CV',
        education: 'BSU',
        description: 'Developer',
      },
      loading: true,
    });

    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByDisplayValue('Updated CV')).toBeDisabled();

    expect(screen.getByRole('button', { name: 'update' })).toBeDisabled();
  });

  it('shows validation errors only when user can edit', () => {
    mockHook({
      errors: {
        name: 'nameError',
        education: 'educationError',
        description: 'descriptionError',
      },
    });

    const { rerender } = render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    expect(screen.getByText('nameError')).toBeInTheDocument();
    expect(screen.getByText('educationError')).toBeInTheDocument();
    expect(screen.getByText('descriptionError')).toBeInTheDocument();

    rerender(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit={false}
        onUpdated={onUpdated}
      />,
    );

    expect(screen.queryByText('nameError')).not.toBeInTheDocument();
    expect(screen.queryByText('educationError')).not.toBeInTheDocument();
    expect(screen.queryByText('descriptionError')).not.toBeInTheDocument();
  });

  it('calls onUpdated after successful update callback', () => {
    render(
      <CvDetailsForm
        cvId="cv-1"
        name="Frontend CV"
        education="BSU"
        description="Developer"
        canEdit
        onUpdated={onUpdated}
      />,
    );

    const config = vi.mocked(useUpdateCvForm).mock.calls[0][0];

    config.onSuccess?.();

    expect(onUpdated).toHaveBeenCalledTimes(1);
  });
});
