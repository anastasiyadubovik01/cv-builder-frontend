import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeviceGuard } from './DeviceGuard';

vi.mock('next-i18next/client', () => ({
  useT: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.device.title': 'Device not supported',
        'errors.device.descriptionFirst': 'Please use a desktop device',
        'errors.device.descriptionSecond': 'Mobile view is not available',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@/components/layout/ErrorState', () => ({
  ErrorState: ({
    title,
    description,
  }: {
    title: string;
    description: React.ReactNode;
  }) => (
    <div data-testid="error-state">
      <h1>{title}</h1>
      <div>{description}</div>
    </div>
  ),
}));

describe('DeviceGuard', () => {
  it('should render children for desktop view and error state for mobile view', () => {
    render(
      <DeviceGuard>
        <div data-testid="desktop-content">Desktop Content</div>
      </DeviceGuard>,
    );

    const desktopContent = screen.getByTestId('desktop-content');
    expect(desktopContent).toBeDefined();
    expect(desktopContent.textContent).toBe('Desktop Content');

    const errorState = screen.getByTestId('error-state');
    expect(errorState).toBeDefined();
    expect(errorState.textContent).toContain('Device not supported');
    expect(errorState.textContent).toContain('Please use a desktop device');
    expect(errorState.textContent).toContain('Mobile view is not available');
  });
});
