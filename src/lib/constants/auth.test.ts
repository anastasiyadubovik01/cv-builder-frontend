import { describe, it, expect } from 'vitest';
import {
  TOKEN_EXPIRY,
  PUBLIC_AUTH_ROUTES,
  IGNORED_AUTH_OPERATIONS,
  UNAUTHENTICATED_CODE,
} from './auth';

describe('auth constants', () => {
  it('should define correct token expiry times', () => {
    expect(TOKEN_EXPIRY).toEqual({
      ACCESS_TOKEN: 900,
      REFRESH_TOKEN: 604800,
    });
    expect(TOKEN_EXPIRY.ACCESS_TOKEN).toBe(15 * 60);
    expect(TOKEN_EXPIRY.REFRESH_TOKEN).toBe(7 * 24 * 60 * 60);
  });

  it('should contain expected public auth routes', () => {
    expect(Array.isArray(PUBLIC_AUTH_ROUTES)).toBe(true);
    expect(PUBLIC_AUTH_ROUTES).toContain('/sign-in');
    expect(PUBLIC_AUTH_ROUTES).toContain('/sign-up');
    expect(PUBLIC_AUTH_ROUTES).toContain('/forgot-password');
    expect(PUBLIC_AUTH_ROUTES).toHaveLength(3);
  });

  it('should contain expected ignored auth operations', () => {
    expect(Array.isArray(IGNORED_AUTH_OPERATIONS)).toBe(true);
    expect(IGNORED_AUTH_OPERATIONS).toContain('Login');
    expect(IGNORED_AUTH_OPERATIONS).toContain('SignUp');
    expect(IGNORED_AUTH_OPERATIONS).toContain('UpdateToken');
    expect(IGNORED_AUTH_OPERATIONS).toHaveLength(3);
  });

  it('should define correct unauthenticated error code', () => {
    expect(UNAUTHENTICATED_CODE).toBe('UNAUTHENTICATED');
    expect(typeof UNAUTHENTICATED_CODE).toBe('string');
  });
});
