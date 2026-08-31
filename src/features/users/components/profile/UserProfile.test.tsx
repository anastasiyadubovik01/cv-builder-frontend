import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

const mockRefetch = vi.fn().mockResolvedValue(undefined);
const mockUseQuery = vi.fn();

vi.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en-US' },
  }),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button type={type ?? 'button'} onClick={onClick} data-testid="ui-button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/loading-overlay', () => ({
  LoadingOverlay: () => <div data-testid="loading-overlay" />,
}));

vi.mock('./ProfileFields', () => ({
  ProfileFields: () => <div data-testid="profile-fields" />,
}));

vi.mock('./UserAvatar', () => ({
  UserAvatar: ({ onUpdated }: { onUpdated: () => Promise<unknown> }) => (
    <div data-testid="user-avatar">
      <button
        data-testid="trigger-avatar-updated"
        onClick={() => void onUpdated()}
      >
        Update Avatar
      </button>
    </div>
  ),
}));

vi.mock('./UserInfo', () => ({
  UserInfo: () => <div data-testid="user-info" />,
}));

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading overlay when query is loading', () => {
    mockUseQuery.mockReturnValue({
      loading: true,
      error: false,
      data: null,
      refetch: mockRefetch,
    });

    render(<UserProfile userId="user-1" canEdit={true} isOwner={true} />);

    expect(screen.getByTestId('loading-overlay')).toBeDefined();
  });

  it('should render error state with retry button when query fails', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: true,
      data: null,
      refetch: mockRefetch,
    });

    render(<UserProfile userId="user-1" canEdit={true} isOwner={true} />);

    expect(screen.getByText('users.details.loadError')).toBeDefined();

    const retryButton = screen.getByTestId('ui-button');
    fireEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should render empty state when user data is missing', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: false,
      data: { user: null },
      refetch: mockRefetch,
    });

    render(<UserProfile userId="user-1" canEdit={true} isOwner={true} />);

    expect(screen.getByText('No user data')).toBeDefined();
  });

  it('should render full user profile content successfully with all optional fallbacks and handle avatar update callback', async () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      error: false,
      data: {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          is_verified: false,
          role: 'Admin',
          created_at: null,
          profile: {
            first_name: null,
            last_name: null,
            avatar: null,
          },
          department: null,
          position: null,
        },
      },
      refetch: mockRefetch,
    });

    render(<UserProfile userId="user-1" canEdit={true} isOwner={true} />);

    expect(screen.getByTestId('user-avatar')).toBeDefined();
    expect(screen.getByTestId('user-info')).toBeDefined();
    expect(screen.getByTestId('profile-fields')).toBeDefined();

    fireEvent.click(screen.getByTestId('trigger-avatar-updated'));
    expect(mockRefetch).toHaveBeenCalled();
  });
});
