import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/auth/tokenUtils';
import { TOKEN_EXPIRY } from '@/lib/constants/auth';

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}));

import { logoutAction, refreshAuthTokensAction, setAuthCookies } from './auth';

describe('auth actions', () => {
  const get = vi.fn();
  const set = vi.fn();
  const deleteCookie = vi.fn();

  const cookieStore = {
    get,
    set,
    delete: deleteCookie,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.cookies.mockResolvedValue(cookieStore);

    vi.stubEnv('NEXT_PUBLIC_GRAPHQL_URL', 'https://example.com/graphql');

    vi.stubEnv('NODE_ENV', 'development');

    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('setAuthCookies', () => {
    it('sets access and refresh token cookies', async () => {
      await setAuthCookies({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(set).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, 'access-token', {
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
      });

      expect(set).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, 'refresh-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
      });
    });

    it('uses secure cookies in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      await setAuthCookies({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(set).toHaveBeenCalledWith(
        ACCESS_TOKEN_KEY,
        'access-token',
        expect.objectContaining({
          secure: true,
        }),
      );

      expect(set).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        'refresh-token',
        expect.objectContaining({
          secure: true,
        }),
      );
    });
  });

  describe('refreshAuthTokensAction', () => {
    it('returns false when refresh token is missing', async () => {
      get.mockReturnValue(undefined);

      const result = await refreshAuthTokensAction();

      expect(get).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);

      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('returns false when GraphQL URL is missing', async () => {
      get.mockReturnValue({
        value: 'refresh-token',
      });

      vi.stubEnv('NEXT_PUBLIC_GRAPHQL_URL', '');

      const result = await refreshAuthTokensAction();

      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('sends refresh token to GraphQL API', async () => {
      get.mockReturnValue({
        value: 'old-refresh-token',
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            updateToken: {
              access_token: 'new-access-token',
              refresh_token: 'new-refresh-token',
            },
          },
        }),
      } as never);

      const result = await refreshAuthTokensAction();

      expect(fetch).toHaveBeenCalledWith('https://example.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer old-refresh-token',
        },
        body: expect.any(String),
      });

      expect(result).toBe(true);
    });

    it('stores new tokens after successful refresh', async () => {
      get.mockReturnValue({
        value: 'old-refresh-token',
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            updateToken: {
              access_token: 'new-access-token',
              refresh_token: 'new-refresh-token',
            },
          },
        }),
      } as never);

      const result = await refreshAuthTokensAction();

      expect(set).toHaveBeenCalledWith(
        ACCESS_TOKEN_KEY,
        'new-access-token',
        expect.objectContaining({
          path: '/',
          maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
        }),
      );

      expect(set).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        'new-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          path: '/',
          maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
        }),
      );

      expect(result).toBe(true);
    });

    it('returns false when backend response is not ok', async () => {
      get.mockReturnValue({
        value: 'refresh-token',
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as never);

      const result = await refreshAuthTokensAction();

      expect(result).toBe(false);
      expect(set).not.toHaveBeenCalled();
    });

    it('returns false when backend does not return access token', async () => {
      get.mockReturnValue({
        value: 'refresh-token',
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            updateToken: {
              refresh_token: 'new-refresh-token',
            },
          },
        }),
      } as never);

      const result = await refreshAuthTokensAction();

      expect(result).toBe(false);
      expect(set).not.toHaveBeenCalled();
    });

    it('returns false when backend does not return refresh token', async () => {
      get.mockReturnValue({
        value: 'refresh-token',
      });

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: {
            updateToken: {
              access_token: 'new-access-token',
            },
          },
        }),
      } as never);

      const result = await refreshAuthTokensAction();

      expect(result).toBe(false);
      expect(set).not.toHaveBeenCalled();
    });

    it('returns false when request fails', async () => {
      get.mockReturnValue({
        value: 'refresh-token',
      });

      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await refreshAuthTokensAction();

      expect(result).toBe(false);
      expect(set).not.toHaveBeenCalled();
    });
  });

  describe('logoutAction', () => {
    it('removes access and refresh token cookies', async () => {
      await logoutAction();

      expect(deleteCookie).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);

      expect(deleteCookie).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);

      expect(deleteCookie).toHaveBeenCalledTimes(2);
    });
  });
});
