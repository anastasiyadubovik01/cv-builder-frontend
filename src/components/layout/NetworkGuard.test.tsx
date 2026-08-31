import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkGuard } from './NetworkGuard';

vi.mock('@/components/layout/NoInternetError', () => ({
  NoInternetError: () => (
    <div data-testid="no-internet-error">No Internet Connection</div>
  ),
}));

describe('NetworkGuard', () => {
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnLine,
    });
  });

  it('should render children when online', () => {
    render(
      <NetworkGuard>
        <div data-testid="child-content">App Content</div>
      </NetworkGuard>,
    );

    expect(screen.getByTestId('child-content')).toBeDefined();
    expect(screen.queryByTestId('no-internet-error')).toBeNull();
  });

  it('should switch to NoInternetError when offline event fires and back when online', () => {
    render(
      <NetworkGuard>
        <div data-testid="child-content">App Content</div>
      </NetworkGuard>,
    );

    expect(screen.getByTestId('child-content')).toBeDefined();

    fireEvent(window, new Event('offline'));

    expect(screen.queryByTestId('child-content')).toBeNull();
    expect(screen.getByTestId('no-internet-error')).toBeDefined();

    fireEvent(window, new Event('online'));

    expect(screen.getByTestId('child-content')).toBeDefined();
    expect(screen.queryByTestId('no-internet-error')).toBeNull();
  });
});
