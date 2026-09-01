import { describe, it, expect } from 'vitest';
import { getEmailFromJwt, getRoleFromJwt, getUserIdFromJwt } from './jwt';

describe('jwt', () => {
  const createMockToken = (payload: Record<string, unknown>): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return `${header}.${encodedPayload}.signature`;
  };

  describe('getEmailFromJwt', () => {
    it('extracts email correctly from a valid token', () => {
      const token = createMockToken({ email: 'user@example.com', sub: 42 });
      expect(getEmailFromJwt(token)).toBe('user@example.com');
    });

    it('returns null if email property is missing', () => {
      const token = createMockToken({ sub: 42 });
      expect(getEmailFromJwt(token)).toBeNull();
    });
  });

  describe('getRoleFromJwt', () => {
    it('extracts role correctly from a valid token', () => {
      const token = createMockToken({
        role: 'admin',
        email: 'admin@example.com',
      });
      expect(getRoleFromJwt(token)).toBe('admin');
    });

    it('returns null if role property is missing', () => {
      const token = createMockToken({ email: 'user@example.com' });
      expect(getRoleFromJwt(token)).toBeNull();
    });
  });

  describe('getUserIdFromJwt', () => {
    it('extracts numeric sub and converts it to string', () => {
      const token = createMockToken({ sub: 12345 });
      expect(getUserIdFromJwt(token)).toBe('12345');
    });

    it('extracts string sub correctly', () => {
      const token = createMockToken({ sub: 'user-uuid-abc' });
      expect(getUserIdFromJwt(token)).toBe('user-uuid-abc');
    });

    it('returns null if sub is undefined', () => {
      const token = createMockToken({ email: 'test@example.com' });
      expect(getUserIdFromJwt(token)).toBeNull();
    });
  });

  describe('JWT decoding edge cases and errors', () => {
    it('returns null if token does not contain a payload section', () => {
      const invalidToken = 'just-one-part';
      expect(getEmailFromJwt(invalidToken)).toBeNull();
    });

    it('returns null if payload JSON is malformed', () => {
      const malformedToken = 'header.not-a-valid-json-payload.signature';
      expect(getEmailFromJwt(malformedToken)).toBeNull();
    });
  });
});
