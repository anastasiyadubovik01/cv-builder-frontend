import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs';

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-icon" {...props} />
);

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render breadcrumbs items correctly with links and current page', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Users', href: '/users' },
      { label: 'Details' },
    ];

    render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeDefined();

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeDefined();
    expect(homeLink.getAttribute('href')).toBe('/');

    const usersLink = screen.getByRole('link', { name: 'Users' });
    expect(usersLink).toBeDefined();
    expect(usersLink.getAttribute('href')).toBe('/users');

    const detailsSpan = screen.getByText('Details');
    expect(detailsSpan).toBeDefined();
    const parentWithAttr = detailsSpan.closest('[aria-current="page"]');
    expect(parentWithAttr).not.toBeNull();
  });

  it('should render icons and accent styles properly', () => {
    const items = [
      { label: 'Dashboard', href: '/', icon: MockIcon },
      { label: 'Error Item', accent: true },
    ];

    render(<Breadcrumbs items={items} />);

    const icons = screen.getAllByTestId('mock-icon');
    expect(icons).toHaveLength(1);

    const errorItem = screen.getByText('Error Item');
    const containerElement = errorItem.parentElement;
    expect(containerElement?.className).toContain('text-destructive');
  });
});
