import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateCvFormValues } from '@/lib/validations/cv';

import { ChangeCvModal } from './ChangeCvModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/dialogs/ChangeDialog', () => ({
  ChangeDialog: ({
    children,
    actionTitle,
    itemType,
    trigger,
    confirmDisabled,
    onConfirm,
    onOpenChange,
  }: {
    children: ReactNode;
    actionTitle: string;
    itemType: string;
    trigger?: ReactNode;
    confirmDisabled?: boolean;
    onConfirm: () => Promise<boolean>;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div
      data-testid="change-dialog"
      data-action-title={actionTitle}
      data-item-type={itemType}
      data-confirm-disabled={String(confirmDisabled)}
    >
      {trigger}

      <button
        type="button"
        disabled={confirmDisabled}
        onClick={() => void onConfirm()}
      >
        Confirm
      </button>

      <button type="button" onClick={() => onOpenChange?.(false)}>
        Close
      </button>

      {children}
    </div>
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

describe('ChangeCvModal', () => {
  const handleSubmit = vi.fn();
  const validateField = vi.fn();
  const onOpenChange = vi.fn();

  const nameChange = vi.fn();
  const educationChange = vi.fn();
  const descriptionChange = vi.fn();

  const handleChange = vi.fn((field: keyof CreateCvFormValues) => {
    if (field === 'name') return nameChange;
    if (field === 'education') return educationChange;

    return descriptionChange;
  });

  const formData: CreateCvFormValues = {
    name: 'Frontend CV',
    education: 'BSU',
    description: 'Frontend developer',
  };

  const renderModal = (
    overrides: Partial<React.ComponentProps<typeof ChangeCvModal>> = {},
  ) =>
    render(
      <ChangeCvModal
        type="Create"
        formData={formData}
        errors={{}}
        loading={false}
        isValid
        handleChange={handleChange}
        validateField={validateField}
        handleSubmit={handleSubmit}
        onOpenChange={onOpenChange}
        {...overrides}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();

    handleSubmit.mockResolvedValue(true);
    validateField.mockReturnValue(true);
  });

  it('passes configuration to ChangeDialog', () => {
    renderModal({
      trigger: <button>Open CV modal</button>,
    });

    const dialog = screen.getByTestId('change-dialog');

    expect(dialog).toHaveAttribute('data-action-title', 'Create');

    expect(dialog).toHaveAttribute('data-item-type', 'CV');

    expect(
      screen.getByRole('button', {
        name: 'Open CV modal',
      }),
    ).toBeInTheDocument();
  });

  it('passes Update action title', () => {
    renderModal({
      type: 'Update',
    });

    expect(screen.getByTestId('change-dialog')).toHaveAttribute(
      'data-action-title',
      'Update',
    );
  });

  it('renders current form values', () => {
    renderModal();

    expect(screen.getByDisplayValue('Frontend CV')).toBeInTheDocument();

    expect(screen.getByDisplayValue('BSU')).toBeInTheDocument();

    expect(screen.getByDisplayValue('Frontend developer')).toBeInTheDocument();
  });

  it('uses handleChange for all fields', () => {
    renderModal();

    fireEvent.change(screen.getByPlaceholderText('cvs.name'), {
      target: {
        value: 'Updated CV',
      },
    });

    fireEvent.change(screen.getByPlaceholderText('cvs.education'), {
      target: {
        value: 'Updated education',
      },
    });

    fireEvent.change(screen.getByPlaceholderText('cvs.description'), {
      target: {
        value: 'Updated description',
      },
    });

    expect(handleChange).toHaveBeenCalledWith('name');
    expect(handleChange).toHaveBeenCalledWith('education');
    expect(handleChange).toHaveBeenCalledWith('description');

    expect(nameChange).toHaveBeenCalled();
    expect(educationChange).toHaveBeenCalled();
    expect(descriptionChange).toHaveBeenCalled();
  });

  it('validates fields on blur', () => {
    renderModal();

    fireEvent.blur(screen.getByPlaceholderText('cvs.name'));

    fireEvent.blur(screen.getByPlaceholderText('cvs.education'));

    fireEvent.blur(screen.getByPlaceholderText('cvs.description'));

    expect(validateField).toHaveBeenCalledWith('name');
    expect(validateField).toHaveBeenCalledWith('education');
    expect(validateField).toHaveBeenCalledWith('description');
  });

  it('shows validation errors', () => {
    renderModal({
      errors: {
        name: 'nameError',
        education: 'educationError',
        description: 'descriptionError',
      },
    });

    expect(screen.getByText('nameError')).toBeInTheDocument();

    expect(screen.getByText('educationError')).toBeInTheDocument();

    expect(screen.getByText('descriptionError')).toBeInTheDocument();
  });

  it('does not show errors when fields have no errors', () => {
    renderModal({
      errors: {},
    });

    expect(screen.queryByText('nameError')).not.toBeInTheDocument();

    expect(screen.queryByText('educationError')).not.toBeInTheDocument();

    expect(screen.queryByText('descriptionError')).not.toBeInTheDocument();
  });

  it('disables confirm when form is invalid', () => {
    renderModal({
      isValid: false,
      loading: false,
    });

    expect(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    ).toBeDisabled();
  });

  it('disables confirm while loading', () => {
    renderModal({
      isValid: true,
      loading: true,
    });

    expect(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    ).toBeDisabled();
  });

  it('enables confirm for valid form when not loading', () => {
    renderModal({
      isValid: true,
      loading: false,
    });

    expect(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    ).toBeEnabled();
  });

  it('submits form on confirm', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    );

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('passes onOpenChange to dialog', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close',
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('works without optional onOpenChange', () => {
    renderModal({
      onOpenChange: undefined,
    });

    expect(() => {
      fireEvent.click(
        screen.getByRole('button', {
          name: 'Close',
        }),
      );
    }).not.toThrow();
  });
});
