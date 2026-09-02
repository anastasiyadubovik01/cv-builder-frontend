import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MultiSelect } from './multi-select';

const mocks = vi.hoisted(() => ({
  rootOnValueChange: undefined as ((value: unknown) => void) | undefined,
}));

vi.mock('@base-ui/react/select', () => ({
  Select: {
    Root: ({
      children,
      value,
      onValueChange,
      disabled,
      multiple,
    }: {
      children: ReactNode;
      value?: string[];
      onValueChange?: (value: unknown) => void;
      disabled?: boolean;
      multiple?: boolean;
    }) => {
      mocks.rootOnValueChange = onValueChange;

      return (
        <div
          data-testid="select-root"
          data-value={JSON.stringify(value)}
          data-disabled={String(Boolean(disabled))}
          data-multiple={String(Boolean(multiple))}
        >
          {children}
        </div>
      );
    },

    Trigger: ({
      children,
      className,
      disabled,
      ...props
    }: {
      children: ReactNode;
      className?: string;
      disabled?: boolean;
      'aria-invalid'?: boolean;
    }) => (
      <div
        data-testid="select-trigger"
        className={className}
        data-disabled={String(Boolean(disabled))}
        aria-invalid={props['aria-invalid']}
      >
        {children}
      </div>
    ),

    Icon: ({ render }: { render?: ReactNode }) => (
      <div data-testid="select-icon">{render}</div>
    ),

    Portal: ({ children }: { children: ReactNode }) => <>{children}</>,

    Positioner: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),

    Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,

    List: ({ children }: { children: ReactNode }) => <div>{children}</div>,

    Item: ({
      children,
      value,
      onClick,
      ...props
    }: {
      children: ReactNode;
      value: string;
      onClick?: () => void;
      'data-selected'?: boolean;
    }) => (
      <button
        type="button"
        data-testid={`option-${value}`}
        data-selected={props['data-selected'] ? 'true' : undefined}
        onClick={onClick}
      >
        {children}
      </button>
    ),

    ItemText: ({ children }: { children: ReactNode }) => (
      <span>{children}</span>
    ),
  },
}));

vi.mock('./label', () => ({
  Label: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => (
    <span data-testid="label" className={className}>
      {children}
    </span>
  ),
}));

vi.mock('./removable-badge', () => ({
  RemovableBadge: ({
    label,
    onRemove,
    disabled,
  }: {
    label: string;
    onRemove: () => void;
    disabled?: boolean;
  }) => (
    <div data-testid={`badge-${label}`}>
      <span>{label}</span>

      <button type="button" onClick={onRemove} disabled={disabled}>
        Remove {label}
      </button>
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  ChevronDownIcon: ({ className }: { className?: string }) => (
    <span data-testid="chevron-icon" className={className} />
  ),

  CheckIcon: ({ className }: { className?: string }) => (
    <span data-testid="check-icon" className={className} />
  ),
}));

describe('MultiSelect', () => {
  const onChange = vi.fn();

  const options = [
    {
      value: 'react',
      label: 'React',
    },
    {
      value: 'typescript',
      label: 'TypeScript',
    },
    {
      value: 'next',
      label: 'Next.js',
    },
  ];

  const renderMultiSelect = (
    overrides: Partial<React.ComponentProps<typeof MultiSelect>> = {},
  ) =>
    render(
      <MultiSelect
        options={options}
        value={[]}
        onChange={onChange}
        placeholder="Select technologies"
        label="Environment"
        {...overrides}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rootOnValueChange = undefined;
  });

  it('renders Base UI select as multiple', () => {
    renderMultiSelect();

    const root = screen.getByTestId('select-root');

    expect(root).toHaveAttribute('data-multiple', 'true');

    expect(root).toHaveAttribute('data-value', '[]');
  });

  it('renders placeholder when nothing is selected', () => {
    renderMultiSelect();

    expect(screen.getByText('Select technologies')).toBeInTheDocument();

    expect(screen.queryByTestId('badge-React')).not.toBeInTheDocument();
  });

  it('renders selected options as badges', () => {
    renderMultiSelect({
      value: ['react', 'typescript'],
    });

    expect(screen.getByTestId('badge-React')).toBeInTheDocument();

    expect(screen.getByTestId('badge-TypeScript')).toBeInTheDocument();

    expect(screen.queryByText('Select technologies')).not.toBeInTheDocument();
  });

  it('renders badges only for values existing in options', () => {
    renderMultiSelect({
      value: ['react', 'unknown'],
    });

    expect(screen.getByTestId('badge-React')).toBeInTheDocument();

    expect(screen.queryByTestId('badge-unknown')).not.toBeInTheDocument();
  });

  it('adds unselected option', () => {
    renderMultiSelect({
      value: ['react'],
    });

    fireEvent.click(screen.getByTestId('option-typescript'));

    expect(onChange).toHaveBeenCalledWith(['react', 'typescript']);
  });

  it('removes selected option when clicked again', () => {
    renderMultiSelect({
      value: ['react', 'typescript'],
    });

    fireEvent.click(screen.getByTestId('option-react'));

    expect(onChange).toHaveBeenCalledWith(['typescript']);
  });

  it('removes selected option from badge', () => {
    renderMultiSelect({
      value: ['react', 'typescript'],
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove React',
      }),
    );

    expect(onChange).toHaveBeenCalledWith(['typescript']);
  });

  it('passes Base UI value changes to onChange', () => {
    renderMultiSelect({
      value: ['react'],
    });

    expect(mocks.rootOnValueChange).toEqual(expect.any(Function));

    mocks.rootOnValueChange?.(['typescript', 'next']);

    expect(onChange).toHaveBeenCalledWith(['typescript', 'next']);
  });

  it('marks selected options', () => {
    renderMultiSelect({
      value: ['react'],
    });

    expect(screen.getByTestId('option-react')).toHaveAttribute(
      'data-selected',
      'true',
    );

    expect(screen.getByTestId('option-typescript')).not.toHaveAttribute(
      'data-selected',
    );
  });

  it('renders check icon only for selected options', () => {
    renderMultiSelect({
      value: ['react'],
    });

    expect(screen.getAllByTestId('check-icon')).toHaveLength(1);

    expect(screen.getByTestId('option-react')).toContainElement(
      screen.getByTestId('check-icon'),
    );
  });

  it('renders all available options', () => {
    renderMultiSelect();

    expect(screen.getByText('React')).toBeInTheDocument();

    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    expect(screen.getByText('Next.js')).toBeInTheDocument();
  });

  it('renders label when label is provided', () => {
    renderMultiSelect();

    expect(screen.getByText('Environment')).toBeInTheDocument();
  });

  it('does not render label when label is missing', () => {
    renderMultiSelect({
      label: undefined,
    });

    expect(screen.queryByText('Environment')).not.toBeInTheDocument();
  });

  it('hides floating label when no values are selected', () => {
    renderMultiSelect({
      value: [],
    });

    expect(screen.getByText('Environment')).toHaveClass('hidden');
  });

  it('does not hide floating label when value is selected', () => {
    renderMultiSelect({
      value: ['react'],
    });

    expect(screen.getByText('Environment')).not.toHaveClass('hidden');
  });

  it('uses destructive label style when error exists', () => {
    renderMultiSelect({
      value: ['react'],
      error: 'Environment is required',
    });

    const labels = screen.getAllByTestId('label');

    expect(labels[0]).toHaveClass('text-destructive');
  });

  it('renders validation error', () => {
    renderMultiSelect({
      error: 'Environment is required',
    });

    expect(screen.getByText('Environment is required')).toBeInTheDocument();

    expect(screen.getByTestId('select-trigger')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not render validation error when error is missing', () => {
    renderMultiSelect({
      error: undefined,
    });

    expect(
      screen.queryByText('Environment is required'),
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('select-trigger')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
  });

  it('passes disabled state to select', () => {
    renderMultiSelect({
      disabled: true,
    });

    expect(screen.getByTestId('select-root')).toHaveAttribute(
      'data-disabled',
      'true',
    );
  });

  it('disables removable badges when component is disabled', () => {
    renderMultiSelect({
      value: ['react'],
      disabled: true,
    });

    expect(
      screen.getByRole('button', {
        name: 'Remove React',
      }),
    ).toBeDisabled();
  });

  it('uses muted placeholder style when enabled', () => {
    renderMultiSelect({
      disabled: false,
    });

    expect(screen.getByText('Select technologies')).toHaveClass(
      'text-muted-foreground',
    );
  });

  it('does not use muted placeholder style when disabled', () => {
    renderMultiSelect({
      disabled: true,
    });

    expect(screen.getByText('Select technologies')).not.toHaveClass(
      'text-muted-foreground',
    );
  });

  it('renders dropdown icon', () => {
    renderMultiSelect();

    expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
  });

  it('supports empty options', () => {
    renderMultiSelect({
      options: [],
    });

    expect(screen.queryByTestId('option-react')).not.toBeInTheDocument();

    expect(screen.getByText('Select technologies')).toBeInTheDocument();
  });

  it('applies custom trigger class', () => {
    renderMultiSelect({
      className: 'custom-trigger',
    });

    expect(screen.getByTestId('select-trigger')).toHaveClass('custom-trigger');
  });
});
