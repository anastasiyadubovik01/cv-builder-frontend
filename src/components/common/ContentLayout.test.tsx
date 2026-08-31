import type { ChangeEvent } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentLayout } from './ContentLayout';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/components/ui/loading-overlay', () => ({
  LoadingOverlay: () => <div data-testid="loading-overlay" />,
}));

vi.mock('@/components/ui/search-input', () => ({
  SearchInput: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <input
      aria-label="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/components/ui/pagination', () => ({
  Pagination: ({
    currentPage,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
  }: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  }) => (
    <div data-testid="pagination">
      <span>
        {currentPage}/{totalPages}/{pageSize}
      </span>

      <button onClick={() => onPageChange(2)}>Change page</button>
      <button onClick={() => onPageSizeChange(20)}>Change page size</button>
    </div>
  ),
}));

vi.mock('@/components/common/QueryErrorState', () => ({
  QueryErrorState: ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry?: () => void;
  }) => (
    <div>
      <span>{message}</span>

      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}));

describe('ContentLayout', () => {
  const t = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );
  });

  it('renders children', () => {
    render(
      <ContentLayout>
        <div>Projects content</div>
      </ContentLayout>,
    );

    expect(screen.getByText('Projects content')).toBeInTheDocument();
  });

  it('shows loading overlay while loading', () => {
    render(
      <ContentLayout isLoading>
        <div>Content</div>
      </ContentLayout>,
    );

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('shows error instead of loading and content', () => {
    render(
      <ContentLayout isLoading hasError errorMessage="Failed to load projects">
        <div>Projects content</div>
      </ContentLayout>,
    );

    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();

    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();

    expect(screen.queryByText('Projects content')).not.toBeInTheDocument();
  });

  it('uses default error message when errorMessage is not provided', () => {
    render(
      <ContentLayout hasError>
        <div>Content</div>
      </ContentLayout>,
    );

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders search and calls onSearchChange', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <ContentLayout search="" onSearchChange={onSearchChange}>
        <div>Content</div>
      </ContentLayout>,
    );

    const searchInput = screen.getByRole('textbox', {
      name: 'search',
    });

    expect(searchInput).toHaveAttribute('placeholder', 'Search');

    await user.type(searchInput, 'react');

    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchChange).toHaveBeenLastCalledWith('t');
  });

  it('renders action trigger without search', () => {
    render(
      <ContentLayout actionTrigger={<button>Create project</button>}>
        <div>Content</div>
      </ContentLayout>,
    );

    expect(
      screen.getByRole('button', { name: 'Create project' }),
    ).toBeInTheDocument();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders pagination and handles pagination actions', async () => {
    const user = userEvent.setup();

    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <ContentLayout
        pagination={{
          currentPage: 1,
          totalPages: 5,
          pageSize: 10,
          onPageChange,
          onPageSizeChange,
        }}
      >
        <div>Content</div>
      </ContentLayout>,
    );

    expect(screen.getByTestId('pagination')).toHaveTextContent('1/5/10');

    await user.click(screen.getByRole('button', { name: 'Change page' }));

    expect(onPageChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('button', { name: 'Change page size' }));

    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('calls onRetry from error state', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ContentLayout hasError errorMessage="Request failed" onRetry={onRetry}>
        <div>Content</div>
      </ContentLayout>,
    );

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
