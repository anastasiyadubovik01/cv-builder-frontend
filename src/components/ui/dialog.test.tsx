import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Dialog,
  DialogAction,
  DialogCancel,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';

const mocks = vi.hoisted(() => ({
  closeProps: [] as Array<Record<string, unknown>>,
}));

vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => (
      <div data-testid="dialog-root" data-slot={props['data-slot'] as string}>
        {children}
      </div>
    ),

    Trigger: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => (
      <button
        type="button"
        data-testid="dialog-trigger-primitive"
        data-slot={props['data-slot'] as string}
      >
        {children}
      </button>
    ),

    Portal: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => (
      <div
        data-testid="dialog-portal-primitive"
        data-slot={props['data-slot'] as string}
      >
        {children}
      </div>
    ),

    Close: ({
      children,
      render,
      className,
      ...props
    }: {
      children?: ReactNode;
      render?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => {
      mocks.closeProps.push({
        render,
        className,
        ...props,
      });

      return (
        <div
          data-testid="dialog-close-primitive"
          data-slot={props['data-slot'] as string}
          className={className}
        >
          {render}
          {children}
        </div>
      );
    },

    Backdrop: ({
      className,
      ...props
    }: {
      className?: string;
      [key: string]: unknown;
    }) => (
      <div
        data-testid="dialog-backdrop"
        data-slot={props['data-slot'] as string}
        className={className}
      />
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
      <div
        data-testid="dialog-popup"
        data-slot={props['data-slot'] as string}
        data-size={props['data-size'] as string}
        className={className}
      >
        {children}
      </div>
    ),

    Title: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <h2
        data-testid="dialog-title-primitive"
        data-slot={props['data-slot'] as string}
        className={className}
      >
        {children}
      </h2>
    ),

    Description: ({
      children,
      className,
      ...props
    }: {
      children?: ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <p
        data-testid="dialog-description-primitive"
        data-slot={props['data-slot'] as string}
        className={className}
      >
        {children}
      </p>
    ),
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    className,
    variant,
    size,
    onClick,
    ...props
  }: {
    children?: ReactNode;
    className?: string;
    variant?: string;
    size?: string;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button
      type="button"
      className={className}
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      data-slot={props['data-slot'] as string}
    >
      {children}
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  XIcon: ({ className }: { className?: string }) => (
    <span data-testid="x-icon" className={className} />
  ),
}));

describe('Dialog UI', () => {
  it('renders Dialog root', () => {
    render(
      <Dialog>
        <div>Dialog content</div>
      </Dialog>,
    );

    expect(screen.getByTestId('dialog-root')).toHaveAttribute(
      'data-slot',
      'dialog',
    );

    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('renders DialogTrigger', () => {
    render(<DialogTrigger>Open dialog</DialogTrigger>);

    expect(screen.getByTestId('dialog-trigger-primitive')).toHaveAttribute(
      'data-slot',
      'dialog-trigger',
    );

    expect(screen.getByText('Open dialog')).toBeInTheDocument();
  });

  it('renders DialogPortal', () => {
    render(<DialogPortal>Portal content</DialogPortal>);

    expect(screen.getByTestId('dialog-portal-primitive')).toHaveAttribute(
      'data-slot',
      'dialog-portal',
    );

    expect(screen.getByText('Portal content')).toBeInTheDocument();
  });

  it('renders DialogClose', () => {
    render(<DialogClose>Close dialog</DialogClose>);

    expect(screen.getByTestId('dialog-close-primitive')).toHaveAttribute(
      'data-slot',
      'dialog-close',
    );

    expect(screen.getByText('Close dialog')).toBeInTheDocument();
  });

  it('renders DialogOverlay with default and custom classes', () => {
    render(<DialogOverlay className="custom-overlay" />);

    const overlay = screen.getByTestId('dialog-backdrop');

    expect(overlay).toHaveAttribute('data-slot', 'dialog-overlay');

    expect(overlay).toHaveClass('fixed', 'inset-0', 'custom-overlay');
  });

  it('renders DialogContent with default size', () => {
    render(<DialogContent>Default content</DialogContent>);

    const popup = screen.getByTestId('dialog-popup');

    expect(popup).toHaveAttribute('data-slot', 'dialog-content');

    expect(popup).toHaveAttribute('data-size', 'default');

    expect(popup).not.toHaveClass('lg:w-[860px]');

    expect(screen.getByText('Default content')).toBeInTheDocument();
  });

  it('renders wide DialogContent with wide class', () => {
    render(
      <DialogContent size="wide" className="custom-content">
        Wide content
      </DialogContent>,
    );

    const popup = screen.getByTestId('dialog-popup');

    expect(popup).toHaveAttribute('data-size', 'wide');

    expect(popup).toHaveClass('lg:w-[860px]', 'custom-content');
  });

  it('renders small DialogContent without wide class', () => {
    render(<DialogContent size="sm">Small content</DialogContent>);

    const popup = screen.getByTestId('dialog-popup');

    expect(popup).toHaveAttribute('data-size', 'sm');

    expect(popup).not.toHaveClass('lg:w-[860px]');
  });

  it('renders overlay inside DialogContent', () => {
    render(<DialogContent>Content</DialogContent>);

    expect(screen.getByTestId('dialog-backdrop')).toBeInTheDocument();

    expect(screen.getByTestId('dialog-portal-primitive')).toBeInTheDocument();
  });

  it('applies DialogContent class to overlay too', () => {
    render(<DialogContent className="shared-class">Content</DialogContent>);

    expect(screen.getByTestId('dialog-backdrop')).toHaveClass('shared-class');

    expect(screen.getByTestId('dialog-popup')).toHaveClass('shared-class');
  });

  it('renders DialogHeader', () => {
    render(<DialogHeader className="custom-header">Header</DialogHeader>);

    const header = screen
      .getByText('Header')
      .closest('[data-slot="dialog-header"]');

    expect(header).toBeInTheDocument();

    expect(header).toHaveClass('relative', 'grid', 'custom-header');
  });

  it('renders DialogFooter', () => {
    render(<DialogFooter className="custom-footer">Footer</DialogFooter>);

    const footer = screen
      .getByText('Footer')
      .closest('[data-slot="dialog-footer"]');

    expect(footer).toBeInTheDocument();

    expect(footer).toHaveClass('flex', 'custom-footer');
  });

  it('renders DialogMedia', () => {
    render(<DialogMedia className="custom-media">Media</DialogMedia>);

    const media = screen
      .getByText('Media')
      .closest('[data-slot="dialog-media"]');

    expect(media).toBeInTheDocument();

    expect(media).toHaveClass('inline-flex', 'custom-media');
  });

  it('renders DialogTitle', () => {
    render(<DialogTitle className="custom-title">Delete user</DialogTitle>);

    const title = screen.getByTestId('dialog-title-primitive');

    expect(title).toHaveAttribute('data-slot', 'dialog-title');

    expect(title).toHaveTextContent('Delete user');

    expect(title).toHaveClass('font-heading', 'custom-title');
  });

  it('renders DialogDescription', () => {
    render(
      <DialogDescription className="custom-description">
        Are you sure?
      </DialogDescription>,
    );

    const description = screen.getByTestId('dialog-description-primitive');

    expect(description).toHaveAttribute('data-slot', 'dialog-description');

    expect(description).toHaveTextContent('Are you sure?');

    expect(description).toHaveClass('text-[16px]', 'custom-description');
  });

  it('renders DialogCloseButton with X icon and accessible text', () => {
    render(<DialogCloseButton />);

    const close = screen.getByTestId('dialog-close-primitive');

    expect(close).toHaveAttribute('data-slot', 'dialog-close-button');

    expect(screen.getByTestId('x-icon')).toBeInTheDocument();

    expect(screen.getByText('Close')).toHaveClass('sr-only');
  });

  it('applies custom class to DialogCloseButton', () => {
    render(<DialogCloseButton className="custom-close" />);

    expect(screen.getByTestId('dialog-close-primitive')).toHaveClass(
      'absolute',
      'custom-close',
    );
  });

  it('renders DialogAction with default styles', () => {
    render(<DialogAction>Save</DialogAction>);

    const button = screen.getByRole('button', {
      name: 'Save',
    });

    expect(button).toHaveAttribute('data-slot', 'dialog-action');

    expect(button).toHaveClass('w-[160px]', 'h-[48px]');
  });

  it('applies custom class to DialogAction', () => {
    render(<DialogAction className="custom-action">Save</DialogAction>);

    expect(
      screen.getByRole('button', {
        name: 'Save',
      }),
    ).toHaveClass('custom-action');
  });

  it('passes onClick to DialogAction', () => {
    const onClick = vi.fn();

    render(<DialogAction onClick={onClick}>Save</DialogAction>);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save',
      }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses default variant and size for DialogCancel', () => {
    render(<DialogCancel>Cancel</DialogCancel>);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('data-variant', 'secondary');

    expect(button).toHaveAttribute('data-size', 'default');

    expect(screen.getByTestId('dialog-close-primitive')).toHaveAttribute(
      'data-slot',
      'dialog-cancel',
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('passes custom variant and size to DialogCancel', () => {
    render(
      <DialogCancel variant="destructive" size="sm" className="custom-cancel">
        Cancel
      </DialogCancel>,
    );

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('data-variant', 'destructive');

    expect(button).toHaveAttribute('data-size', 'sm');

    expect(screen.getByTestId('dialog-close-primitive')).toHaveClass(
      'w-[160px]',
      'h-[48px]',
      'custom-cancel',
    );
  });
});
