import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateCvProjectInputValues } from '@/lib/validations/cv-project';

import { ChangeCvProjectModal } from './ChangeCvProjectModal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/dialogs/ChangeDialog', () => ({
  ChangeDialog: ({
    children,
    trigger,
    onConfirm,
    confirmDisabled,
    onOpenChange,
    actionTitle,
    itemType,
  }: {
    children: ReactNode;
    trigger?: ReactNode;
    onConfirm: () => Promise<boolean>;
    confirmDisabled?: boolean;
    onOpenChange?: (open: boolean) => void;
    actionTitle: string;
    itemType: string;
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
        Close dialog
      </button>

      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    placeholder,
    disabled,
    required,
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
  }) => (
    <input
      aria-label={placeholder}
      value={value ?? ''}
      disabled={disabled}
      required={required}
      readOnly
    />
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({
    value,
    placeholder,
    disabled,
    error,
    onChange,
    onBlur,
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
  }) => (
    <div>
      <textarea
        aria-label={placeholder}
        value={value ?? ''}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
      />

      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    value,
    placeholder,
    error,
    onChange,
    onBlur,
  }: {
    value?: string;
    placeholder?: string;
    error?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
  }) => (
    <div>
      <input
        aria-label={placeholder}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />

      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/multi-select', () => ({
  MultiSelect: ({
    options,
    value,
    onChange,
    label,
    disabled,
    error,
  }: {
    options: Array<{
      value: string;
      label: string;
    }>;
    value: string[];
    onChange: (value: string[]) => void;
    label?: string;
    disabled?: boolean;
    error?: string;
  }) => (
    <div
      data-testid={`multi-select-${label}`}
      data-value={JSON.stringify(value)}
      data-options={JSON.stringify(options)}
      data-disabled={String(Boolean(disabled))}
    >
      <button type="button" onClick={() => onChange(['Developer', 'QA'])}>
        Change {label}
      </button>

      <button type="button">Inside {label}</button>

      {error && <span>{error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    items,
    value,
    disabled,
    onValueChange,
  }: {
    children: ReactNode;
    items: Array<{
      value: string;
      label: string;
    }>;
    value?: string;
    disabled?: boolean;
    onValueChange?: (value: string) => void;
  }) => (
    <div
      data-testid="project-select"
      data-value={value}
      data-items={JSON.stringify(items)}
      data-disabled={String(Boolean(disabled))}
    >
      <button type="button" onClick={() => onValueChange?.('project-2')}>
        Select project
      </button>

      <button type="button" onClick={() => onValueChange?.('')}>
        Select empty
      </button>

      {children}
    </div>
  ),

  SelectTrigger: ({
    children,
    error,
    onBlur,
    ...props
  }: {
    children: ReactNode;
    error?: string;
    onBlur?: () => void;
    'aria-label'?: string;
    'aria-invalid'?: boolean;
  }) => (
    <div>
      <button
        type="button"
        aria-label={props['aria-label']}
        aria-invalid={props['aria-invalid']}
        onBlur={onBlur}
      >
        {children}
      </button>

      {error && <span>{error}</span>}
    </div>
  ),

  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),

  SelectContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),

  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}));

describe('ChangeCvProjectModal', () => {
  const handleSubmit = vi.fn();
  const handleProjectSelect = vi.fn();
  const setFieldValue = vi.fn();
  const validateField = vi.fn();
  const responsibilitiesChange = vi.fn();
  const onOpenChange = vi.fn();

  const handleChange = vi.fn(() => responsibilitiesChange);

  const formData: CreateCvProjectInputValues = {
    projectId: 'project-1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    roles: 'Developer, QA',
    responsibilities: 'Development',
    domain: 'Healthcare',
    description: 'Project description',
    environment: 'React, TypeScript',
    projectStartDate: '2023-01-01',
    projectEndDate: '2025-01-01',
  };

  const catalogProjects = [
    {
      id: 'project-1',
      name: 'Project One',
    },
    {
      id: 'project-2',
      name: 'Project Two',
    },
  ] as never;

  const positions = [
    {
      id: 'position-1',
      name: 'Developer',
    },
    {
      id: 'position-2',
      name: 'QA',
    },
  ] as never;

  const renderModal = (
    overrides: Partial<React.ComponentProps<typeof ChangeCvProjectModal>> = {},
  ) =>
    render(
      <ChangeCvProjectModal
        type="Create"
        formData={formData}
        errors={{}}
        catalogProjects={catalogProjects}
        positions={positions}
        loading={false}
        isValid
        handleChange={handleChange}
        setFieldValue={setFieldValue}
        validateField={validateField}
        handleProjectSelect={handleProjectSelect}
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

  it('passes dialog configuration', () => {
    renderModal({
      trigger: <button>Open modal</button>,
    });

    const dialog = screen.getByTestId('change-dialog');

    expect(dialog).toHaveAttribute('data-action-title', 'Create');

    expect(dialog).toHaveAttribute('data-item-type', 'project');

    expect(
      screen.getByRole('button', {
        name: 'Open modal',
      }),
    ).toBeInTheDocument();
  });

  it('maps catalog projects to select options', () => {
    renderModal();

    const select = screen.getByTestId('project-select');

    expect(JSON.parse(select.getAttribute('data-items') ?? '[]')).toEqual([
      {
        value: 'project-1',
        label: 'Project One',
      },
      {
        value: 'project-2',
        label: 'Project Two',
      },
    ]);

    expect(screen.getByText('Project One')).toBeInTheDocument();

    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });

  it('maps positions to role options', () => {
    renderModal();

    const roles = screen.getByTestId('multi-select-projects.roles');

    expect(JSON.parse(roles.getAttribute('data-options') ?? '[]')).toEqual([
      {
        value: 'Developer',
        label: 'Developer',
      },
      {
        value: 'QA',
        label: 'QA',
      },
    ]);
  });

  it('parses environment into multiselect values', () => {
    renderModal({
      formData: {
        ...formData,
        environment: ' React, , TypeScript,  Next.js ',
      },
    });

    const environment = screen.getByTestId('multi-select-projects.environment');

    expect(JSON.parse(environment.getAttribute('data-value') ?? '[]')).toEqual([
      'React',
      'TypeScript',
      'Next.js',
    ]);

    expect(environment).toHaveAttribute('data-disabled', 'true');
  });

  it('uses empty environment when value is missing', () => {
    renderModal({
      formData: {
        ...formData,
        environment: '',
      },
    });

    const environment = screen.getByTestId('multi-select-projects.environment');

    expect(JSON.parse(environment.getAttribute('data-value') ?? '[]')).toEqual(
      [],
    );
  });

  it('parses selected roles and removes empty values', () => {
    renderModal({
      formData: {
        ...formData,
        roles: ' Developer, , QA,  Manager ',
      },
    });

    const roles = screen.getByTestId('multi-select-projects.roles');

    expect(JSON.parse(roles.getAttribute('data-value') ?? '[]')).toEqual([
      'Developer',
      'QA',
      'Manager',
    ]);
  });

  it('uses empty roles when roles are missing', () => {
    renderModal({
      formData: {
        ...formData,
        roles: '',
      },
    });

    const roles = screen.getByTestId('multi-select-projects.roles');

    expect(JSON.parse(roles.getAttribute('data-value') ?? '[]')).toEqual([]);
  });

  it('selects project and updates projectId', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select project',
      }),
    );

    expect(handleProjectSelect).toHaveBeenCalledWith('project-2');

    expect(setFieldValue).toHaveBeenCalledWith('projectId', 'project-2');
  });

  it('still updates projectId when handleProjectSelect is missing', () => {
    renderModal({
      handleProjectSelect: undefined,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select project',
      }),
    );

    expect(setFieldValue).toHaveBeenCalledWith('projectId', 'project-2');
  });

  it('does nothing when selected project value is empty', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Select empty',
      }),
    );

    expect(handleProjectSelect).not.toHaveBeenCalled();

    expect(setFieldValue).not.toHaveBeenCalled();
  });

  it('disables project selection in update mode', () => {
    renderModal({
      type: 'Update',
    });

    expect(screen.getByTestId('project-select')).toHaveAttribute(
      'data-disabled',
      'true',
    );
  });

  it('keeps project selection enabled in create mode', () => {
    renderModal();

    expect(screen.getByTestId('project-select')).toHaveAttribute(
      'data-disabled',
      'false',
    );
  });

  it('updates start and end dates', () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('projects.startDate'), {
      target: {
        value: '2024-02-01',
      },
    });

    fireEvent.change(screen.getByLabelText('projects.endDate'), {
      target: {
        value: '2024-11-30',
      },
    });

    expect(setFieldValue).toHaveBeenCalledWith('startDate', '2024-02-01');

    expect(setFieldValue).toHaveBeenCalledWith('endDate', '2024-11-30');
  });

  it('updates roles as comma separated string', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Change projects.roles',
      }),
    );

    expect(setFieldValue).toHaveBeenCalledWith('roles', 'Developer, QA');
  });

  it('uses handleChange for responsibilities', () => {
    renderModal();

    const responsibilities = screen.getByLabelText('projects.responsibilities');

    fireEvent.change(responsibilities, {
      target: {
        value: 'New responsibilities',
      },
    });

    expect(handleChange).toHaveBeenCalledWith('responsibilities');

    expect(responsibilitiesChange).toHaveBeenCalled();
  });

  it('validates project and date fields on blur', () => {
    renderModal();

    fireEvent.blur(screen.getByLabelText('projects.name'));

    fireEvent.blur(screen.getByLabelText('projects.startDate'));

    fireEvent.blur(screen.getByLabelText('projects.endDate'));

    fireEvent.blur(screen.getByLabelText('projects.responsibilities'));

    expect(validateField).toHaveBeenCalledWith('projectId');

    expect(validateField).toHaveBeenCalledWith('startDate');

    expect(validateField).toHaveBeenCalledWith('endDate');

    expect(validateField).toHaveBeenCalledWith('responsibilities');
  });

  it('validates roles when focus leaves roles section', () => {
    renderModal();

    const roleButton = screen.getByRole('button', {
      name: 'Change projects.roles',
    });

    fireEvent.blur(roleButton, {
      relatedTarget: null,
    });

    expect(validateField).toHaveBeenCalledWith('roles');
  });

  it('does not validate roles when focus stays inside roles section', () => {
    renderModal();

    const roleButton = screen.getByRole('button', {
      name: 'Change projects.roles',
    });

    const insideButton = screen.getByRole('button', {
      name: 'Inside projects.roles',
    });

    fireEvent.blur(roleButton, {
      relatedTarget: insideButton,
    });

    expect(validateField).not.toHaveBeenCalledWith('roles');
  });

  it('shows translated validation errors', () => {
    renderModal({
      errors: {
        projectId: 'projectError',
        startDate: 'startDateError',
        endDate: 'endDateError',
        roles: 'rolesError',
        responsibilities: 'responsibilitiesError',
      },
    });

    expect(screen.getByText('projectError')).toBeInTheDocument();

    expect(screen.getByText('startDateError')).toBeInTheDocument();

    expect(screen.getByText('endDateError')).toBeInTheDocument();

    expect(screen.getByText('rolesError')).toBeInTheDocument();

    expect(screen.getByText('responsibilitiesError')).toBeInTheDocument();
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

  it('uses false as default isValid value', () => {
    renderModal({
      isValid: undefined,
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

  it('submits valid form', () => {
    renderModal({
      isValid: true,
      loading: false,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    );

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('passes open change handler to dialog', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close dialog',
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows project domain and description as disabled fields', () => {
    renderModal();

    expect(screen.getByLabelText('projects.domain')).toHaveValue('Healthcare');

    expect(screen.getByLabelText('projects.description')).toHaveValue(
      'Project description',
    );

    expect(screen.getByLabelText('projects.domain')).toBeDisabled();

    expect(screen.getByLabelText('projects.description')).toBeDisabled();
  });

  it('uses empty domain and description fallbacks', () => {
    renderModal({
      formData: {
        ...formData,
        domain: undefined,
        description: undefined,
      },
    });

    expect(screen.getByLabelText('projects.domain')).toHaveValue('');

    expect(screen.getByLabelText('projects.description')).toHaveValue('');
  });
});
