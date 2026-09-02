import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Pagination } from './pagination';

vi.mock('@/components/icons/chevron-left-icon', () => ({
  ChevronLeftIcon: ({ className }: { className?: string }) => (
    <span data-testid="chevron-icon" className={className} />
  ),
}));

vi.mock('@/lib/constants/pagination', () => ({
  PAGE_SIZE_OPTIONS: [10, 20, 50],
}));

describe('Pagination', () => {
  const onPageChange = vi.fn();
  const onPageSizeChange = vi.fn();

  const renderPagination = (
    overrides: Partial<React.ComponentProps<typeof Pagination>> = {},
  ) =>
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        {...overrides}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there is only one page', () => {
    const { container } = renderPagination({
      totalPages: 1,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there are no pages', () => {
    const { container } = renderPagination({
      totalPages: 0,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders all pages when totalPages is 4 or less', () => {
    renderPagination({
      currentPage: 2,
      totalPages: 4,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();

    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('renders right ellipsis near the beginning', () => {
    renderPagination({
      currentPage: 1,
      totalPages: 10,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();

    expect(screen.getAllByText('...')).toHaveLength(1);

    expect(screen.queryByRole('button', { name: '3' })).not.toBeInTheDocument();
  });

  it('uses beginning pagination layout on page 2', () => {
    renderPagination({
      currentPage: 2,
      totalPages: 10,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();

    expect(screen.getAllByText('...')).toHaveLength(1);
  });

  it('renders left ellipsis near the end', () => {
    renderPagination({
      currentPage: 9,
      totalPages: 10,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();

    expect(screen.getAllByText('...')).toHaveLength(1);
  });

  it('uses ending pagination layout on the last page', () => {
    renderPagination({
      currentPage: 10,
      totalPages: 10,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '10' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(screen.getAllByText('...')).toHaveLength(1);
  });

  it('renders both ellipses in the middle', () => {
    renderPagination({
      currentPage: 5,
      totalPages: 10,
    });

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();

    expect(screen.getAllByText('...')).toHaveLength(2);
  });

  it('marks current page with aria-current', () => {
    renderPagination({
      currentPage: 3,
      totalPages: 4,
    });

    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('applies active border class to current page', () => {
    renderPagination({
      currentPage: 2,
      totalPages: 4,
    });

    expect(screen.getByRole('button', { name: '2' })).toHaveClass(
      'border-[var(--pagination-arrow)]',
    );

    expect(screen.getByRole('button', { name: '1' })).toHaveClass(
      'border-[var(--pagination-border)]',
    );
  });

  it('changes page when page button is clicked', () => {
    renderPagination({
      currentPage: 2,
      totalPages: 4,
    });

    fireEvent.click(screen.getByRole('button', { name: '4' }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('goes to previous page', () => {
    renderPagination({
      currentPage: 3,
      totalPages: 5,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Previous page',
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('goes to next page', () => {
    renderPagination({
      currentPage: 3,
      totalPages: 5,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Next page',
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous button on first page', () => {
    renderPagination({
      currentPage: 1,
      totalPages: 5,
    });

    expect(
      screen.getByRole('button', {
        name: 'Previous page',
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole('button', {
        name: 'Next page',
      }),
    ).toBeEnabled();
  });

  it('disables next button on last page', () => {
    renderPagination({
      currentPage: 5,
      totalPages: 5,
    });

    expect(
      screen.getByRole('button', {
        name: 'Previous page',
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole('button', {
        name: 'Next page',
      }),
    ).toBeDisabled();
  });

  it('renders page size options', () => {
    renderPagination();

    const select = screen.getByRole('combobox');

    expect(select).toHaveValue('10');

    expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();

    expect(screen.getByRole('option', { name: '20' })).toBeInTheDocument();

    expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument();
  });

  it('changes page size as a number', () => {
    renderPagination();

    fireEvent.change(screen.getByRole('combobox'), {
      target: {
        value: '20',
      },
    });

    expect(onPageSizeChange).toHaveBeenCalledWith(20);

    expect(typeof onPageSizeChange.mock.calls[0][0]).toBe('number');
  });

  it('renders navigation and select icons', () => {
    renderPagination();

    const icons = screen.getAllByTestId('chevron-icon');

    expect(icons).toHaveLength(3);

    expect(icons[0]).toHaveClass('size-6');

    expect(icons[1]).toHaveClass('rotate-180');

    expect(icons[2]).toHaveClass('-rotate-90');
  });
});
