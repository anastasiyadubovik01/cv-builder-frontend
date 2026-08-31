import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoInternetError } from './NoInternetError';

vi.mock('next-i18next/client', () => ({
  useT: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.noInternet.title': 'No Internet Connection',
        'errors.noInternet.descriptionFirst':
          'Please check your network settings',
        'errors.noInternet.descriptionSecond': 'And try again',
        retry: 'Retry',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/components/layout/ErrorState', () => ({
  ErrorState: ({
    title,
    description,
    actionLabel,
    onAction,
  }: {
    title: string;
    description: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
  }) => (
    <div data-testid="error-state">
      <h1>{title}</h1>
      <div>{description}</div>
      {actionLabel && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  ),
}));

describe('NoInternetError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error state with translated text and action button', () => {
    render(<NoInternetError />);

    const errorState = screen.getByTestId('error-state');
    expect(errorState).toBeDefined();
    expect(errorState.textContent).toContain('No Internet Connection');
    expect(errorState.textContent).toContain(
      'Please check your network settings',
    );
    expect(errorState.textContent).toContain('And try again');

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    expect(retryButton).toBeDefined();
  });

  it('should invoke custom onRetry callback when action button is clicked', () => {
    const mockOnRetry = vi.fn();
    render(<NoInternetError onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});
