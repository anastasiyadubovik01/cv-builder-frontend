import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

vi.mock('@base-ui/react/select', () => ({
  Select: {
    Root: ({ children }: { children?: ReactNode }) => (
      <div data-testid="select-root">{children}</div>
    ),

    Group: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="primitive-group" className={className} {...props}>
        {children}
      </div>
    ),

    Value: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="primitive-value" className={className} {...props}>
        {children}
      </div>
    ),

    Trigger: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <button
        type="button"
        data-testid="primitive-trigger"
        className={className}
        {...props}
      >
        {children}
      </button>
    ),

    Icon: ({ render }: { render?: ReactNode }) => (
      <span data-testid="primitive-icon">{render}</span>
    ),

    Portal: ({ children }: { children?: ReactNode }) => <>{children}</>,

    Positioner: ({
      children,
      side,
      sideOffset,
      align,
      alignOffset,
      alignItemWithTrigger,
      className,
    }: {
      children?: ReactNode;
      side?: string;
      sideOffset?: number;
      align?: string;
      alignOffset?: number;
      alignItemWithTrigger?: boolean;
      className?: string;
    }) => (
      <div
        data-testid="primitive-positioner"
        data-side={side}
        data-side-offset={String(sideOffset)}
        data-align={align}
        data-align-offset={String(alignOffset)}
        data-align-item-with-trigger={String(alignItemWithTrigger)}
        className={className}
      >
        {children}
      </div>
    ),

    Popup: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="primitive-popup" className={className} {...props}>
        {children}
      </div>
    ),

    List: ({ children }: { children?: ReactNode }) => (
      <div data-testid="primitive-list">{children}</div>
    ),

    GroupLabel: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="primitive-group-label" className={className} {...props}>
        {children}
      </div>
    ),

    Item: ({
      children,
      className,
      value,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      value?: string;
      [key: string]: unknown;
    }) => (
      <div
        data-testid="primitive-item"
        data-value={value}
        className={className}
        {...props}
      >
        {children}
      </div>
    ),

    ItemText: ({ children }: { children?: ReactNode }) => (
      <span data-testid="primitive-item-text">{children}</span>
    ),

    Separator: ({
      className,
      ...props
    }: {
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="primitive-separator" className={className} {...props} />
    ),

    ScrollUpArrow: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="primitive-scroll-up" className={className} {...props}>
        {children}
      </div>
    ),

    ScrollDownArrow: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="primitive-scroll-down" className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock('./label', () => ({
  Label: ({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
  }) => (
    <span data-testid="label" className={className}>
      {children}
    </span>
  ),
}));

vi.mock('lucide-react', () => ({
  ChevronDownIcon: ({ className }: { className?: string }) => (
    <span data-testid="chevron-down" className={className} />
  ),

  ChevronUpIcon: ({ className }: { className?: string }) => (
    <span data-testid="chevron-up" className={className} />
  ),
}));

describe('Select UI', () => {
  it('renders SelectGroup with children and custom class', () => {
    render(<SelectGroup className="custom-group">Group content</SelectGroup>);

    const group = screen.getByTestId('primitive-group');

    expect(group).toHaveTextContent('Group content');

    expect(group).toHaveClass('scroll-my-1');
    expect(group).toHaveClass('custom-group');

    expect(group).toHaveAttribute('data-slot', 'select-group');
  });

  it('renders SelectValue with custom class', () => {
    render(<SelectValue className="custom-value">Current value</SelectValue>);

    const value = screen.getByTestId('primitive-value');

    expect(value).toHaveTextContent('Current value');

    expect(value).toHaveClass('flex', 'flex-1', 'text-left', 'custom-value');

    expect(value).toHaveAttribute('data-slot', 'select-value');
  });

  it('renders trigger children and dropdown icon', () => {
    render(
      <SelectTrigger>
        <span>Selected option</span>
      </SelectTrigger>,
    );

    expect(screen.getByText('Selected option')).toBeInTheDocument();

    expect(screen.getByTestId('chevron-down')).toBeInTheDocument();

    expect(screen.getByTestId('primitive-trigger')).toHaveAttribute(
      'data-slot',
      'select-trigger',
    );
  });

  it('renders trigger without label', () => {
    render(<SelectTrigger>Value</SelectTrigger>);

    expect(screen.queryByTestId('label')).not.toBeInTheDocument();
  });

  it('renders trigger label without error', () => {
    render(<SelectTrigger label="Position">Developer</SelectTrigger>);

    const label = screen.getByTestId('label');

    expect(label).toHaveTextContent('Position');

    expect(label).toHaveClass('peer-aria-invalid:block');

    expect(label).toHaveClass('peer-aria-invalid:text-destructive');
  });

  it('renders destructive trigger label when error exists', () => {
    render(
      <SelectTrigger label="Position" error="Position is required">
        Developer
      </SelectTrigger>,
    );

    const labels = screen.getAllByTestId('label');

    expect(labels[0]).toHaveTextContent('Position');

    expect(labels[0]).toHaveClass('text-destructive');

    expect(labels[0]).not.toHaveClass('peer-aria-invalid:block');
  });

  it('renders validation error and marks trigger invalid', () => {
    render(<SelectTrigger error="Required">Value</SelectTrigger>);

    expect(screen.getByText('Required')).toBeInTheDocument();

    expect(screen.getByTestId('primitive-trigger')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not render error when error is missing', () => {
    render(<SelectTrigger>Value</SelectTrigger>);

    expect(screen.queryByText('Required')).not.toBeInTheDocument();

    expect(screen.getByTestId('primitive-trigger')).toHaveAttribute(
      'aria-invalid',
      'false',
    );
  });

  it('applies trigger and container custom classes', () => {
    const { container } = render(
      <SelectTrigger
        className="custom-trigger"
        containerClassName="custom-container"
      >
        Value
      </SelectTrigger>,
    );

    expect(screen.getByTestId('primitive-trigger')).toHaveClass(
      'custom-trigger',
    );

    expect(container.firstElementChild).toHaveClass(
      'relative',
      'custom-container',
    );
  });

  it('passes additional props to trigger', () => {
    render(
      <SelectTrigger aria-label="Project" disabled>
        Value
      </SelectTrigger>,
    );

    const trigger = screen.getByTestId('primitive-trigger');

    expect(trigger).toHaveAttribute('aria-label', 'Project');

    expect(trigger).toBeDisabled();
  });

  it('uses default SelectContent positioning', () => {
    render(
      <SelectContent>
        <div>Option</div>
      </SelectContent>,
    );

    const positioner = screen.getByTestId('primitive-positioner');

    expect(positioner).toHaveAttribute('data-side', 'bottom');

    expect(positioner).toHaveAttribute('data-side-offset', '0');

    expect(positioner).toHaveAttribute('data-align', 'start');

    expect(positioner).toHaveAttribute('data-align-offset', '0');

    expect(positioner).toHaveAttribute('data-align-item-with-trigger', 'false');
  });

  it('passes custom positioning to SelectContent', () => {
    render(
      <SelectContent
        side="top"
        sideOffset={8}
        align="end"
        alignOffset={4}
        alignItemWithTrigger
      >
        Option
      </SelectContent>,
    );

    const positioner = screen.getByTestId('primitive-positioner');

    expect(positioner).toHaveAttribute('data-side', 'top');

    expect(positioner).toHaveAttribute('data-side-offset', '8');

    expect(positioner).toHaveAttribute('data-align', 'end');

    expect(positioner).toHaveAttribute('data-align-offset', '4');

    expect(positioner).toHaveAttribute('data-align-item-with-trigger', 'true');

    expect(screen.getByTestId('primitive-popup')).toHaveAttribute(
      'data-align-trigger',
      'true',
    );
  });

  it('renders content, list and both scroll buttons', () => {
    render(
      <SelectContent>
        <div>First option</div>
      </SelectContent>,
    );

    expect(screen.getByText('First option')).toBeInTheDocument();

    expect(screen.getByTestId('primitive-list')).toBeInTheDocument();

    expect(screen.getByTestId('primitive-scroll-up')).toBeInTheDocument();

    expect(screen.getByTestId('primitive-scroll-down')).toBeInTheDocument();
  });

  it('applies custom class to SelectContent popup', () => {
    render(<SelectContent className="custom-popup">Option</SelectContent>);

    expect(screen.getByTestId('primitive-popup')).toHaveClass('custom-popup');

    expect(screen.getByTestId('primitive-popup')).toHaveAttribute(
      'data-slot',
      'select-content',
    );
  });

  it('renders SelectLabel', () => {
    render(<SelectLabel className="custom-label">Technologies</SelectLabel>);

    const label = screen.getByTestId('primitive-group-label');

    expect(label).toHaveTextContent('Technologies');

    expect(label).toHaveClass('custom-label');

    expect(label).toHaveAttribute('data-slot', 'select-label');
  });

  it('renders SelectItem', () => {
    render(
      <SelectItem value="react" className="custom-item">
        React
      </SelectItem>,
    );

    const item = screen.getByTestId('primitive-item');

    expect(item).toHaveAttribute('data-value', 'react');

    expect(item).toHaveClass('custom-item');

    expect(item).toHaveAttribute('data-slot', 'select-item');

    expect(screen.getByTestId('primitive-item-text')).toHaveTextContent(
      'React',
    );
  });

  it('renders SelectSeparator', () => {
    render(<SelectSeparator className="custom-separator" />);

    const separator = screen.getByTestId('primitive-separator');

    expect(separator).toHaveClass('h-px', 'custom-separator');

    expect(separator).toHaveAttribute('data-slot', 'select-separator');
  });

  it('renders scroll up button with icon', () => {
    render(<SelectScrollUpButton className="custom-up" />);

    const button = screen.getByTestId('primitive-scroll-up');

    expect(button).toHaveClass('custom-up');

    expect(button).toHaveAttribute('data-slot', 'select-scroll-up-button');

    expect(screen.getByTestId('chevron-up')).toHaveClass('size-4');
  });

  it('renders scroll down button with icon', () => {
    render(<SelectScrollDownButton className="custom-down" />);

    const button = screen.getByTestId('primitive-scroll-down');

    expect(button).toHaveClass('custom-down');

    expect(button).toHaveAttribute('data-slot', 'select-scroll-down-button');

    expect(screen.getByTestId('chevron-down')).toHaveClass('size-4');
  });
});
