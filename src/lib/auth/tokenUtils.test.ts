import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  getAccessToken,
  getCookie,
} from './tokenUtils';

describe('tokenUtils', () => {
  afterEach(() => {
    vi.unstubAllGlobals();

    document.cookie = `${ACCESS_TOKEN_KEY}=; Max-Age=0; path=/`;
    document.cookie = `${REFRESH_TOKEN_KEY}=; Max-Age=0; path=/`;
  });

  it('exports correct token cookie keys', () => {
    expect(ACCESS_TOKEN_KEY).toBe('access_token');
    expect(REFRESH_TOKEN_KEY).toBe('refresh_token');
  });

  it('returns cookie value by name', () => {
    document.cookie = `${ACCESS_TOKEN_KEY}=test-access-token; path=/`;

    expect(getCookie(ACCESS_TOKEN_KEY)).toBe('test-access-token');
  });

  it('returns undefined when cookie does not exist', () => {
    expect(getCookie('unknown_cookie')).toBeUndefined();
  });

  it('returns access token from cookie', () => {
    document.cookie = `${ACCESS_TOKEN_KEY}=my-token; path=/`;

    expect(getAccessToken()).toBe('my-token');
  });

  it('returns undefined when document is not available', () => {
    vi.stubGlobal('document', undefined);

    expect(getCookie(ACCESS_TOKEN_KEY)).toBeUndefined();
  });
});
