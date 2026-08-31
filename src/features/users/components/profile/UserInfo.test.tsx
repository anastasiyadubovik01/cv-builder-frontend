import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserInfo } from './UserInfo';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'users.details.memberSince') {
        return `Member since ${options?.date ?? ''}`;
      }
      return key;
    },
  }),
}));

describe('UserInfo', () => {
  it('should render user full name, email, and member since date correctly', () => {
    render(
      <UserInfo
        firstName="John"
        lastName="Doe"
        email="john.doe@example.com"
        memberSince="January 2026"
      />,
    );

    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('john.doe@example.com')).toBeDefined();
    expect(screen.getByText('Member since January 2026')).toBeDefined();
  });
});
