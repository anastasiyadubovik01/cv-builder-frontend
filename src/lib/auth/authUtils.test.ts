import { describe, expect, it, vi } from 'vitest';
import type { GraphQLFormattedError } from 'graphql';

import {
  createAuthHeader,
  isIgnoredAuthOperation,
  isPublicAuthRoute,
  isUnauthenticatedError,
  stripLocalePrefix,
} from './authUtils';

vi.mock('@/lib/constants/auth', () => ({
  PUBLIC_AUTH_ROUTES: ['/sign-in', '/forgot-password'],
  UNAUTHENTICATED_CODE: 'UNAUTHENTICATED',
  IGNORED_AUTH_OPERATIONS: ['Login', 'RefreshToken'],
}));

describe('isUnauthenticatedError', () => {
  it('returns true when errors contain unauthenticated error', () => {
    const errors = [
      {
        message: 'Unauthorized',
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      },
    ] as GraphQLFormattedError[];

    expect(isUnauthenticatedError(errors)).toBe(true);
  });

  it('returns false when unauthenticated error is not present', () => {
    const errors = [
      {
        message: 'Something went wrong',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
    ] as GraphQLFormattedError[];

    expect(isUnauthenticatedError(errors)).toBe(false);
  });

  it('returns false for empty errors', () => {
    expect(isUnauthenticatedError()).toBe(false);
  });
});

describe('isIgnoredAuthOperation', () => {
  it('returns true for ignored operation', () => {
    expect(isIgnoredAuthOperation('Login')).toBe(true);
  });

  it('returns false for unknown operation', () => {
    expect(isIgnoredAuthOperation('GetUsers')).toBe(false);
  });

  it('returns false when operation name is missing', () => {
    expect(isIgnoredAuthOperation()).toBe(false);
  });
});

describe('stripLocalePrefix', () => {
  const supportedLngs = ['en', 'ru'];

  it('removes locale prefix from pathname', () => {
    expect(stripLocalePrefix('/en/profile', supportedLngs)).toBe('/profile');
  });

  it('returns root path when pathname contains only locale', () => {
    expect(stripLocalePrefix('/en', supportedLngs)).toBe('/');
  });

  it('removes trailing slash after stripping locale', () => {
    expect(stripLocalePrefix('/ru/profile/', supportedLngs)).toBe('/profile');
  });

  it('returns pathname unchanged when locale is not supported', () => {
    expect(stripLocalePrefix('/de/profile', supportedLngs)).toBe('/de/profile');
  });

  it('returns pathname unchanged when there is no locale prefix', () => {
    expect(stripLocalePrefix('/profile', supportedLngs)).toBe('/profile');
  });
});

describe('isPublicAuthRoute', () => {
  it('returns true for exact public auth route', () => {
    expect(isPublicAuthRoute('/sign-in')).toBe(true);
  });

  it('returns true for nested public auth route', () => {
    expect(isPublicAuthRoute('/forgot-password/confirm')).toBe(true);
  });

  it('returns false for private route', () => {
    expect(isPublicAuthRoute('/users')).toBe(false);
  });

  it('does not match a route with only a similar prefix', () => {
    expect(isPublicAuthRoute('/sign-in-extra')).toBe(false);
  });
});

describe('createAuthHeader', () => {
  it('creates authorization header when token exists', () => {
    expect(createAuthHeader('test-token')).toEqual({
      authorization: 'Bearer test-token',
    });
  });

  it('returns empty object when token is missing', () => {
    expect(createAuthHeader()).toEqual({});
    expect(createAuthHeader(null)).toEqual({});
  });
});
