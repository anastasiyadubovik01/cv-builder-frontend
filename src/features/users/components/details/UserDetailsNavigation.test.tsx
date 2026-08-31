import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserDetailsNavigation } from './UserDetailsNavigation';

const mockPathname = vi.fn().mockReturnValue('/users/1');
const mockUseQuery = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock('@/components/icons/user-breadcrumb-icon', () => ({
  UserBreadcrumbIcon: () => <div data-testid="user-breadcrumb-icon" />,
}));

vi.mock('@/components/layout/Breadcrumbs', () => ({
  Breadcrumbs: ({
    items,
  }: {
    items: Array<{ label: string; accent?: boolean }>;
  }) => (
    <div data-testid="breadcrumbs">
      {items.map((item, idx) => (
        <span key={idx} data-accent={String(!!item.accent)}>
          {item.label}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('@/components/ui/nav-tabs', () => ({
  NavTabs: ({
    items,
  }: {
    items: Array<{ key: string; label: string; href: string }>;
  }) => (
    <div data-testid="nav-tabs">
      {items.map((tab) => (
        <div key={tab.key} data-testid={`tab-${tab.key}`}>
          {tab.label}
        </div>
      ))}
    </div>
  ),
}));

describe('UserDetailsNavigation', () => {
  const defaultLabels = {
    employees: 'Employees',
    profile: 'Profile',
    skills: 'Skills',
    languages: 'Languages',
    cvs: 'CVs',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render breadcrumbs and tabs using full_name from query data', () => {
    mockUseQuery.mockReturnValue({
      data: {
        user: {
          profile: {
            full_name: 'Alice Smith',
            first_name: 'Alice',
            last_name: 'Smith',
          },
          email: 'alice@example.com',
        },
      },
    });
    mockPathname.mockReturnValue('/users/1');

    render(
      <UserDetailsNavigation
        userId="1"
        labels={defaultLabels}
        showCvs={false}
      />,
    );

    expect(screen.getByText('Employees')).toBeDefined();
    expect(screen.getByText('Alice Smith')).toBeDefined();
    expect(screen.getByTestId('tab-profile')).toBeDefined();
    expect(screen.getByTestId('tab-skills')).toBeDefined();
    expect(screen.getByTestId('tab-languages')).toBeDefined();
    expect(screen.queryByTestId('tab-cvs')).toBeNull();
  });

  it('should fallback to constructed name or email if full_name is missing, and render CV tab when showCvs is true', () => {
    mockUseQuery.mockReturnValue({
      data: {
        user: {
          profile: {
            full_name: '',
            first_name: 'Bob',
            last_name: '',
          },
          email: 'bob@example.com',
        },
      },
    });
    mockPathname.mockReturnValue('/users/1/skills');

    render(
      <UserDetailsNavigation
        userId="1"
        labels={defaultLabels}
        showCvs={true}
      />,
    );

    expect(screen.getByText('Bob')).toBeDefined();
    expect(screen.getByTestId('tab-cvs')).toBeDefined();
  });

  it('should use email as fallback if both full_name and profile names are missing', () => {
    mockUseQuery.mockReturnValue({
      data: {
        user: {
          profile: {
            full_name: '',
            first_name: '',
            last_name: '',
          },
          email: 'fallback@example.com',
        },
      },
    });
    mockPathname.mockReturnValue('/unknown-path');

    render(<UserDetailsNavigation userId="1" labels={defaultLabels} />);

    expect(screen.getByText('fallback@example.com')).toBeDefined();
  });
});
