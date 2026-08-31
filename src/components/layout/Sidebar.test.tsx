import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './Sidebar';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockClearStore = vi.fn().mockResolvedValue(undefined);
const mockLogoutAction = vi.fn().mockResolvedValue(undefined);
const mockUseQuery = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/users',
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('next-i18next/client', () => ({
  useT: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sidebar.employees': 'Employees',
        'sidebar.skills': 'Skills',
        'sidebar.languages': 'Languages',
        'sidebar.cvs': 'CVs',
        'sidebar.departments': 'Departments',
        'sidebar.positions': 'Positions',
        'sidebar.projects': 'Projects',
        'sidebar.profile': 'Profile',
        'sidebar.settings': 'Settings',
        'sidebar.logout': 'Logout',
        'sidebar.collapse': 'Collapse',
        'sidebar.expand': 'Expand',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: (query: unknown) => mockUseQuery(query),
  useApolloClient: () => ({
    clearStore: mockClearStore,
  }),
}));

vi.mock('@/app/actions/auth', () => ({
  logoutAction: () => mockLogoutAction(),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt} />;
  },
}));

describe('Sidebar', () => {
  const mockCurrentUser = {
    id: '1',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    avatar: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: { me: mockCurrentUser },
    });
  });

  it('should render standard navigation items and current user profile correctly', () => {
    render(<Sidebar role="Employee" />);

    expect(screen.getByText('Employees')).toBeDefined();
    expect(screen.getByText('Skills')).toBeDefined();
    expect(screen.getByText('Languages')).toBeDefined();
    expect(screen.getByText('CVs')).toBeDefined();

    expect(screen.queryByText('Departments')).toBeNull();
    expect(screen.queryByText('Positions')).toBeNull();
    expect(screen.queryByText('Projects')).toBeNull();

    expect(screen.getByText('John Doe')).toBeDefined();
  });

  it('should render admin navigation items when role is Admin', () => {
    render(<Sidebar role="Admin" />);

    expect(screen.getByText('Departments')).toBeDefined();
    expect(screen.getByText('Positions')).toBeDefined();
    expect(screen.getByText('Projects')).toBeDefined();
  });

  it('should toggle collapse state when desktop collapse button is clicked', async () => {
    render(<Sidebar role="Employee" />);

    const collapseButtons = screen.getAllByRole('button', {
      name: /collapse|expand/i,
    });
    const desktopToggleButton = collapseButtons.find((btn) =>
      btn.className.includes('lg:inline-flex'),
    );

    expect(desktopToggleButton).toBeDefined();

    if (desktopToggleButton) {
      await userEvent.click(desktopToggleButton);
    }
  });

  it('should handle logout action properly when logout button is clicked', async () => {
    render(<Sidebar role="Employee" />);

    const userTrigger = screen.getByText('John Doe');
    await userEvent.click(userTrigger);

    const logoutButton = await screen.findByText('Logout');
    expect(logoutButton).toBeDefined();

    await userEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogoutAction).toHaveBeenCalledTimes(1);
      expect(mockClearStore).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/sign-in');
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
