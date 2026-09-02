import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/auth/tokenUtils';
import { TOKEN_EXPIRY } from '@/lib/constants/auth';

const mocks = vi.hoisted(() => {
  const i18nProxy = vi.fn();

  return {
    i18nProxy,
    createProxy: vi.fn(() => i18nProxy),
    redirect: vi.fn(),
    stripLocalePrefix: vi.fn(),
    isPublicAuthRoute: vi.fn(),
    refreshTokensInMiddleware: vi.fn(),
  };
});

vi.mock('next/server', () => ({
  NextResponse: {
    redirect: mocks.redirect,
  },
}));

vi.mock('next-i18next/proxy', () => ({
  createProxy: mocks.createProxy,
}));

vi.mock('../i18n.config', () => ({
  default: {
    supportedLngs: ['en', 'ru'],
  },
}));

vi.mock('@/lib/auth/authUtils', () => ({
  stripLocalePrefix: mocks.stripLocalePrefix,
  isPublicAuthRoute: mocks.isPublicAuthRoute,
}));

vi.mock('@/lib/auth/middleware', () => ({
  refreshTokensInMiddleware: mocks.refreshTokensInMiddleware,
}));

import { proxy } from './proxy';

function createResponse() {
  return {
    headers: {
      set: vi.fn(),
    },
    cookies: {
      set: vi.fn(),
    },
  };
}

function createRequest({
  path = '/dashboard',
  accessToken,
  refreshToken,
}: {
  path?: string;
  accessToken?: string;
  refreshToken?: string;
} = {}) {
  const url = new URL(path, 'https://example.com');

  const cookieValues = new Map<string, string>();

  if (accessToken) {
    cookieValues.set(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    cookieValues.set(REFRESH_TOKEN_KEY, refreshToken);
  }

  const get = vi.fn((name: string) => {
    const value = cookieValues.get(name);

    return value ? { value } : undefined;
  });

  const set = vi.fn((name: string, value: string) => {
    cookieValues.set(name, value);
  });

  const request = {
    url: url.toString(),
    nextUrl: {
      pathname: url.pathname,
      searchParams: url.searchParams,
    },
    cookies: {
      get,
      set,
    },
  };

  return {
    request,
    get,
    set,
  };
}

describe('proxy', () => {
  let response: ReturnType<typeof createResponse>;

  beforeEach(() => {
    vi.clearAllMocks();

    response = createResponse();

    mocks.stripLocalePrefix.mockImplementation((pathname: string) => pathname);

    mocks.isPublicAuthRoute.mockReturnValue(false);

    mocks.refreshTokensInMiddleware.mockResolvedValue(null);

    mocks.i18nProxy.mockReturnValue(response);

    mocks.redirect.mockImplementation((url: URL) => ({
      type: 'redirect',
      url,
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redirects unauthenticated user from private route to sign-in', async () => {
    const { request } = createRequest({
      path: '/projects',
    });

    const result = await proxy(request as never);

    expect(mocks.redirect).toHaveBeenCalledTimes(1);

    const redirectUrl = mocks.redirect.mock.calls[0][0] as URL;

    expect(redirectUrl.pathname).toBe('/sign-in');

    expect(mocks.i18nProxy).not.toHaveBeenCalled();

    expect(result).toEqual({
      type: 'redirect',
      url: redirectUrl,
    });
  });

  it('allows authenticated user to open private route', async () => {
    const { request } = createRequest({
      path: '/projects',
      accessToken: 'access-token',
    });

    const result = await proxy(request as never);

    expect(mocks.i18nProxy).toHaveBeenCalledWith(request);

    expect(response.headers.set).toHaveBeenCalledWith(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate',
    );

    expect(mocks.redirect).not.toHaveBeenCalled();

    expect(result).toBe(response);
  });

  it('allows unauthenticated user to open public auth route', async () => {
    mocks.isPublicAuthRoute.mockReturnValue(true);

    const { request } = createRequest({
      path: '/sign-in',
    });

    const result = await proxy(request as never);

    expect(mocks.i18nProxy).toHaveBeenCalledWith(request);
    expect(mocks.redirect).not.toHaveBeenCalled();

    expect(result).toBe(response);
  });

  it('redirects authenticated user from public auth route to home', async () => {
    mocks.isPublicAuthRoute.mockReturnValue(true);

    const { request } = createRequest({
      path: '/sign-in',
      accessToken: 'access-token',
    });

    await proxy(request as never);

    expect(mocks.redirect).toHaveBeenCalledTimes(1);

    const redirectUrl = mocks.redirect.mock.calls[0][0] as URL;

    expect(redirectUrl.pathname).toBe('/');

    expect(mocks.i18nProxy).not.toHaveBeenCalled();
  });

  it('redirects reset-password without token to forgot-password', async () => {
    const { request } = createRequest({
      path: '/reset-password',
    });

    await proxy(request as never);

    expect(mocks.redirect).toHaveBeenCalledTimes(1);

    const redirectUrl = mocks.redirect.mock.calls[0][0] as URL;

    expect(redirectUrl.pathname).toBe('/forgot-password');

    expect(mocks.i18nProxy).not.toHaveBeenCalled();
  });

  it('allows reset-password when token is provided', async () => {
    const { request } = createRequest({
      path: '/reset-password?token=reset-token',
    });

    const result = await proxy(request as never);

    expect(mocks.i18nProxy).toHaveBeenCalledWith(request);
    expect(mocks.redirect).not.toHaveBeenCalled();

    expect(result).toBe(response);
  });

  it('refreshes tokens when access token is missing but refresh token exists', async () => {
    mocks.refreshTokensInMiddleware.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const { request, set } = createRequest({
      path: '/projects',
      refreshToken: 'old-refresh-token',
    });

    await proxy(request as never);

    expect(mocks.refreshTokensInMiddleware).toHaveBeenCalledWith(
      'old-refresh-token',
    );

    expect(set).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, 'new-access-token');

    expect(set).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, 'new-refresh-token');

    expect(mocks.i18nProxy).toHaveBeenCalledWith(request);
  });

  it('writes refreshed tokens to response cookies', async () => {
    mocks.refreshTokensInMiddleware.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const { request } = createRequest({
      path: '/projects',
      refreshToken: 'old-refresh-token',
    });

    await proxy(request as never);

    expect(response.cookies.set).toHaveBeenCalledWith(
      ACCESS_TOKEN_KEY,
      'new-access-token',
      {
        path: '/',
        sameSite: 'lax',
        secure: false,
        maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
      },
    );

    expect(response.cookies.set).toHaveBeenCalledWith(
      REFRESH_TOKEN_KEY,
      'new-refresh-token',
      {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
        maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
      },
    );
  });

  it('uses secure cookies in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    mocks.refreshTokensInMiddleware.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const { request } = createRequest({
      path: '/projects',
      refreshToken: 'old-refresh-token',
    });

    await proxy(request as never);

    expect(response.cookies.set).toHaveBeenCalledWith(
      ACCESS_TOKEN_KEY,
      'new-access-token',
      expect.objectContaining({
        secure: true,
      }),
    );

    expect(response.cookies.set).toHaveBeenCalledWith(
      REFRESH_TOKEN_KEY,
      'new-refresh-token',
      expect.objectContaining({
        secure: true,
      }),
    );
  });

  it('does not try to refresh when access token already exists', async () => {
    const { request } = createRequest({
      path: '/projects',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    await proxy(request as never);

    expect(mocks.refreshTokensInMiddleware).not.toHaveBeenCalled();

    expect(response.cookies.set).not.toHaveBeenCalled();
  });

  it('continues when refresh fails but refresh token still exists', async () => {
    mocks.refreshTokensInMiddleware.mockResolvedValue(null);

    const { request } = createRequest({
      path: '/projects',
      refreshToken: 'invalid-refresh-token',
    });

    const result = await proxy(request as never);

    expect(mocks.refreshTokensInMiddleware).toHaveBeenCalledWith(
      'invalid-refresh-token',
    );

    expect(mocks.i18nProxy).toHaveBeenCalledWith(request);

    expect(mocks.redirect).not.toHaveBeenCalled();

    expect(result).toBe(response);
  });

  it('normalizes pathname using supported languages', async () => {
    const { request } = createRequest({
      path: '/en/projects',
      accessToken: 'access-token',
    });

    mocks.stripLocalePrefix.mockReturnValue('/projects');

    await proxy(request as never);

    expect(mocks.stripLocalePrefix).toHaveBeenCalledWith('/en/projects', [
      'en',
      'ru',
    ]);

    expect(mocks.isPublicAuthRoute).toHaveBeenCalledWith('/projects');
  });
});
