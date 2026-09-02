import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

vi.mock('@base-ui/react/alert-dialog', () => ({
  AlertDialog: {
    Root: ({
      children,
      ...props
    }: {
      children?: ReactNode;
      [key: string]: unknown;
    }) => (
      <div
        data-testid="alert-dialog-root"
        data-slot={props['data-slot'] as string}
      >
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
        data-testid="alert-dialog-trigger-primitive"
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
        data-testid="alert-dialog-portal-primitive"
        data-slot={props['data-slot'] as string}
      >
        {children}
      </div>
    ),

    Backdrop: ({
      className,
      ...props
    }: {
      className?: string;
      [key: string]: unknown;
    }) => (
      <div
        data-testid="alert-dialog-backdrop"
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
        data-testid="alert-dialog-popup"
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
        data-testid="alert-dialog-title-primitive"
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
        data-testid="alert-dialog-description-primitive"
        data-slot={props['data-slot'] as string}
        className={className}
      >
        {children}
      </p>
    ),

    Close: ({
      children,
      render,
      className,
      ...props
    }: {
      children?: ReactNode;
      render?: {
        props?: {
          variant?: string;
          size?: string;
          className?: string;
          children?: ReactNode;
        };
      };
      className?: string;
      [key: string]: unknown;
    }) => {
      const renderProps = render?.props;

      return (
        <div
          data-testid="alert-dialog-close-primitive"
          data-slot={props['data-slot'] as string}
          className={className}
        >
          {render ? (
            <button
              type="button"
              data-variant={renderProps?.variant}
              data-size={renderProps?.size}
              className={renderProps?.className}
            >
              {renderProps?.children ?? children}
            </button>
          ) : (
            children
          )}
        </div>
      );
    },
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
      data-slot={props['data-slot'] as string}
      onClick={onClick}
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

describe('AlertDialog UI', () => {
  it('renders AlertDialog root', () => {
    render(
      <AlertDialog>
        <div>Dialog content</div>
      </AlertDialog>,
    );

    expect(screen.getByTestId('alert-dialog-root')).toHaveAttribute(
      'data-slot',
      'alert-dialog',
    );

    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('renders AlertDialogTrigger', () => {
    render(<AlertDialogTrigger>Delete</AlertDialogTrigger>);

    expect(
      screen.getByTestId('alert-dialog-trigger-primitive'),
    ).toHaveAttribute('data-slot', 'alert-dialog-trigger');

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders AlertDialogPortal', () => {
    render(<AlertDialogPortal>Portal content</AlertDialogPortal>);

    expect(screen.getByTestId('alert-dialog-portal-primitive')).toHaveAttribute(
      'data-slot',
      'alert-dialog-portal',
    );

    expect(screen.getByText('Portal content')).toBeInTheDocument();
  });

  it('renders AlertDialogOverlay with custom class', () => {
    render(<AlertDialogOverlay className="custom-overlay" />);

    const overlay = screen.getByTestId('alert-dialog-backdrop');

    expect(overlay).toHaveAttribute('data-slot', 'alert-dialog-overlay');

    expect(overlay).toHaveClass('fixed', 'inset-0', 'custom-overlay');
  });

  it('renders content with default size', () => {
    render(<AlertDialogContent>Default content</AlertDialogContent>);

    const popup = screen.getByTestId('alert-dialog-popup');

    expect(popup).toHaveAttribute('data-slot', 'alert-dialog-content');

    expect(popup).toHaveAttribute('data-size', 'default');

    expect(screen.getByText('Default content')).toBeInTheDocument();
  });

  it('renders content with small size', () => {
    render(
      <AlertDialogContent size="sm" className="custom-content">
        Small content
      </AlertDialogContent>,
    );

    const popup = screen.getByTestId('alert-dialog-popup');

    expect(popup).toHaveAttribute('data-size', 'sm');

    expect(popup).toHaveClass('custom-content');
  });

  it('renders portal and overlay inside content', () => {
    render(<AlertDialogContent>Content</AlertDialogContent>);

    expect(
      screen.getByTestId('alert-dialog-portal-primitive'),
    ).toBeInTheDocument();

    expect(screen.getByTestId('alert-dialog-backdrop')).toBeInTheDocument();
  });

  it('passes content class to overlay and popup', () => {
    render(
      <AlertDialogContent className="shared-class">Content</AlertDialogContent>,
    );

    expect(screen.getByTestId('alert-dialog-backdrop')).toHaveClass(
      'shared-class',
    );

    expect(screen.getByTestId('alert-dialog-popup')).toHaveClass(
      'shared-class',
    );
  });

  it('renders AlertDialogHeader', () => {
    render(
      <AlertDialogHeader className="custom-header">Header</AlertDialogHeader>,
    );

    const header = screen
      .getByText('Header')
      .closest('[data-slot="alert-dialog-header"]');

    expect(header).toBeInTheDocument();

    expect(header).toHaveClass('relative', 'grid', 'custom-header');
  });

  it('renders AlertDialogFooter', () => {
    render(
      <AlertDialogFooter className="custom-footer">Footer</AlertDialogFooter>,
    );

    const footer = screen
      .getByText('Footer')
      .closest('[data-slot="alert-dialog-footer"]');

    expect(footer).toBeInTheDocument();

    expect(footer).toHaveClass('flex', 'custom-footer');
  });

  it('renders AlertDialogMedia', () => {
    render(<AlertDialogMedia className="custom-media">Media</AlertDialogMedia>);

    const media = screen
      .getByText('Media')
      .closest('[data-slot="alert-dialog-media"]');

    expect(media).toBeInTheDocument();

    expect(media).toHaveClass('inline-flex', 'custom-media');
  });

  it('renders AlertDialogTitle', () => {
    render(
      <AlertDialogTitle className="custom-title">Delete CV</AlertDialogTitle>,
    );

    const title = screen.getByTestId('alert-dialog-title-primitive');

    expect(title).toHaveAttribute('data-slot', 'alert-dialog-title');

    expect(title).toHaveTextContent('Delete CV');

    expect(title).toHaveClass('font-heading', 'custom-title');
  });

  it('renders AlertDialogDescription', () => {
    render(
      <AlertDialogDescription className="custom-description">
        Are you sure?
      </AlertDialogDescription>,
    );

    const description = screen.getByTestId(
      'alert-dialog-description-primitive',
    );

    expect(description).toHaveAttribute(
      'data-slot',
      'alert-dialog-description',
    );

    expect(description).toHaveTextContent('Are you sure?');

    expect(description).toHaveClass('text-[16px]', 'custom-description');
  });

  it('renders AlertDialogAction', () => {
    render(
      <AlertDialogAction className="custom-action">Delete</AlertDialogAction>,
    );

    const button = screen.getByRole('button', {
      name: 'Delete',
    });

    expect(button).toHaveAttribute('data-slot', 'alert-dialog-action');

    expect(button).toHaveClass('w-[160px]', 'h-[48px]', 'custom-action');
  });

  it('passes click handler to AlertDialogAction', () => {
    const onClick = vi.fn();

    render(<AlertDialogAction onClick={onClick}>Delete</AlertDialogAction>);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('uses default variant and size for AlertDialogCancel', () => {
    render(<AlertDialogCancel>Cancel</AlertDialogCancel>);

    const button = screen.getByRole('button', {
      name: 'Cancel',
    });

    expect(button).toHaveAttribute('data-variant', 'secondary');

    expect(button).toHaveAttribute('data-size', 'default');

    expect(screen.getByTestId('alert-dialog-close-primitive')).toHaveAttribute(
      'data-slot',
      'alert-dialog-cancel',
    );
  });

  it('uses custom variant and size for AlertDialogCancel', () => {
    render(
      <AlertDialogCancel
        variant="destructive"
        size="sm"
        className="custom-cancel"
      >
        Cancel
      </AlertDialogCancel>,
    );

    const button = screen.getByRole('button', {
      name: 'Cancel',
    });

    expect(button).toHaveAttribute('data-variant', 'destructive');

    expect(button).toHaveAttribute('data-size', 'sm');

    expect(screen.getByTestId('alert-dialog-close-primitive')).toHaveClass(
      'w-[160px]',
      'h-[48px]',
      'custom-cancel',
    );
  });

  it('renders AlertDialogCloseButton', () => {
    render(<AlertDialogCloseButton />);

    const close = screen.getByTestId('alert-dialog-close-primitive');

    expect(close).toHaveAttribute('data-slot', 'alert-dialog-close-button');

    expect(screen.getByTestId('x-icon')).toBeInTheDocument();

    expect(screen.getByText('Close')).toHaveClass('sr-only');
  });

  it('applies custom class to AlertDialogCloseButton', () => {
    render(<AlertDialogCloseButton className="custom-close" />);

    expect(screen.getByTestId('alert-dialog-close-primitive')).toHaveClass(
      'absolute',
      'custom-close',
    );
  });
});
