import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTranslation } from 'react-i18next';

import { QueryErrorState } from './QueryErrorState';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

describe('QueryErrorState', () => {
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

  it('renders error message', () => {
    render(<QueryErrorState message="Failed to load data" />);

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<QueryErrorState message="Failed to load data" />);

    expect(
      screen.queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();
  });

  it('renders default retry button when onRetry is provided', () => {
    render(<QueryErrorState message="Failed to load data" onRetry={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('calls onRetry after retry button click', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<QueryErrorState message="Failed to load data" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders custom retry label', () => {
    render(
      <QueryErrorState
        message="Failed to load data"
        onRetry={vi.fn()}
        retryLabel="Try again"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });
});
