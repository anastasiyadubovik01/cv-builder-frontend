import type {
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SKILLS_QUERY } from '@/api/skills';
import type { CreateProjectInputValues } from '@/lib/validations/project';

import { ChangeProjectModal } from './ChangeProjectModal';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}));

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

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({
    value,
    placeholder,
    error,
    onChange,
  }: {
    value?: string;
    placeholder?: string;
    error?: string;
    onChange: (value: string) => void;
  }) => (
    <div>
      <input
        aria-label={placeholder}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
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
    error,
    disabled,
  }: {
    options: Array<{
      value: string;
      label: string;
    }>;
    value: string[];
    onChange: (value: string[]) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
  }) => (
    <div
      data-testid="skills-select"
      data-options={JSON.stringify(options)}
      data-value={JSON.stringify(value)}
      data-disabled={String(Boolean(disabled))}
    >
      <button type="button" onClick={() => onChange(['React', 'TypeScript'])}>
        Change {label}
      </button>

      {error && <span>{error}</span>}
    </div>
  ),
}));

describe('ChangeProjectModal', () => {
  const handleSubmit = vi.fn();
  const setFieldValue = vi.fn();
  const onOpenChange = vi.fn();

  const nameChange = vi.fn();
  const domainChange = vi.fn();
  const startDateChange = vi.fn();
  const endDateChange = vi.fn();
  const descriptionChange = vi.fn();

  const handleChange = vi.fn((field: keyof CreateProjectInputValues) => {
    const handlers = {
      name: nameChange,
      domain: domainChange,
      startDate: startDateChange,
      endDate: endDateChange,
      description: descriptionChange,
      environment: vi.fn(),
    };

    return handlers[field];
  });

  const formData: CreateProjectInputValues = {
    name: 'CV Builder',
    domain: 'HR',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: 'Project description',
    environment: 'React, TypeScript',
  };

  const renderModal = (
    overrides: Partial<React.ComponentProps<typeof ChangeProjectModal>> = {},
  ) =>
    render(
      <ChangeProjectModal
        type="Create"
        formData={formData}
        errors={{}}
        loading={false}
        handleChange={handleChange}
        setFieldValue={setFieldValue}
        handleSubmit={handleSubmit}
        onOpenChange={onOpenChange}
        {...overrides}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();

    handleSubmit.mockResolvedValue(true);

    vi.mocked(useQuery).mockReturnValue({
      data: {
        skills: {
          items: [
            {
              id: 'skill-1',
              name: 'React',
            },
            {
              id: 'skill-2',
              name: 'TypeScript',
            },
          ],
        },
      },
      loading: false,
    } as never);
  });

  it('loads skills catalog', () => {
    renderModal();

    expect(useQuery).toHaveBeenCalledWith(SKILLS_QUERY, {
      variables: {
        params: {
          limit: 1000,
        },
      },
    });
  });

  it('passes dialog configuration', () => {
    renderModal({
      trigger: <button>Open project modal</button>,
    });

    const dialog = screen.getByTestId('change-dialog');

    expect(dialog).toHaveAttribute('data-action-title', 'Create');

    expect(dialog).toHaveAttribute('data-item-type', 'project');

    expect(
      screen.getByRole('button', {
        name: 'Open project modal',
      }),
    ).toBeInTheDocument();
  });

  it('maps skills to options', () => {
    renderModal();

    const select = screen.getByTestId('skills-select');

    expect(JSON.parse(select.getAttribute('data-options') ?? '[]')).toEqual([
      {
        value: 'React',
        label: 'React',
      },
      {
        value: 'TypeScript',
        label: 'TypeScript',
      },
    ]);
  });

  it('uses empty skill options when skills are missing', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: false,
    } as never);

    renderModal();

    const select = screen.getByTestId('skills-select');

    expect(JSON.parse(select.getAttribute('data-options') ?? '[]')).toEqual([]);
  });

  it('parses selected environment skills', () => {
    renderModal({
      formData: {
        ...formData,
        environment: ' React, , TypeScript,  Next.js ',
      },
    });

    const select = screen.getByTestId('skills-select');

    expect(JSON.parse(select.getAttribute('data-value') ?? '[]')).toEqual([
      'React',
      'TypeScript',
      'Next.js',
    ]);
  });

  it('uses empty selected skills when environment is empty', () => {
    renderModal({
      formData: {
        ...formData,
        environment: '',
      },
    });

    const select = screen.getByTestId('skills-select');

    expect(JSON.parse(select.getAttribute('data-value') ?? '[]')).toEqual([]);
  });

  it('updates environment from selected skills', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Change projects.environment',
      }),
    );

    expect(setFieldValue).toHaveBeenCalledWith(
      'environment',
      'React, TypeScript',
    );
  });

  it('uses handleChange for text fields', () => {
    renderModal();

    fireEvent.change(screen.getByPlaceholderText('projects.name'), {
      target: {
        value: 'Updated project',
      },
    });

    fireEvent.change(screen.getByPlaceholderText('projects.domain'), {
      target: {
        value: 'Healthcare',
      },
    });

    fireEvent.change(screen.getByPlaceholderText('projects.description'), {
      target: {
        value: 'Updated description',
      },
    });

    expect(handleChange).toHaveBeenCalledWith('name');
    expect(handleChange).toHaveBeenCalledWith('domain');
    expect(handleChange).toHaveBeenCalledWith('description');

    expect(nameChange).toHaveBeenCalled();
    expect(domainChange).toHaveBeenCalled();
    expect(descriptionChange).toHaveBeenCalled();
  });

  it('updates start and end dates through handleChange', () => {
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

    expect(handleChange).toHaveBeenCalledWith('startDate');

    expect(handleChange).toHaveBeenCalledWith('endDate');

    expect(startDateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: {
          value: '2024-02-01',
        },
      }),
    );

    expect(endDateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: {
          value: '2024-11-30',
        },
      }),
    );
  });

  it('shows validation errors', () => {
    renderModal({
      errors: {
        name: 'nameError',
        domain: 'domainError',
        startDate: 'startDateError',
        endDate: 'endDateError',
        description: 'descriptionError',
        environment: 'environmentError',
      },
    });

    expect(screen.getByText('nameError')).toBeInTheDocument();

    expect(screen.getByText('domainError')).toBeInTheDocument();

    expect(screen.getByText('startDateError')).toBeInTheDocument();

    expect(screen.getByText('endDateError')).toBeInTheDocument();

    expect(screen.getByText('descriptionError')).toBeInTheDocument();

    expect(screen.getByText('environmentError')).toBeInTheDocument();
  });

  it('disables environment select while skills are loading', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: true,
    } as never);

    renderModal();

    expect(screen.getByTestId('skills-select')).toHaveAttribute(
      'data-disabled',
      'true',
    );
  });

  it('disables confirm while loading', () => {
    renderModal({
      loading: true,
    });

    expect(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    ).toBeDisabled();
  });

  it('enables confirm when not loading', () => {
    renderModal({
      loading: false,
    });

    expect(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    ).toBeEnabled();
  });

  it('submits project', () => {
    renderModal();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirm',
      }),
    );

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('passes Update action type', () => {
    renderModal({
      type: 'Update',
    });

    expect(screen.getByTestId('change-dialog')).toHaveAttribute(
      'data-action-title',
      'Update',
    );
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
});
