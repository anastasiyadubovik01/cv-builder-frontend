import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createProxy } from 'next-i18next/proxy';
import i18nConfig from '../i18n.config';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/auth/tokenUtils';
import { TOKEN_EXPIRY } from '@/lib/constants/auth';
import { stripLocalePrefix, isPublicAuthRoute } from '@/lib/auth/authUtils';
import { refreshTokensInMiddleware, type Tokens } from '@/lib/auth/middleware';

const i18nProxy = createProxy(i18nConfig);

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const normalizedPath = stripLocalePrefix(pathname, i18nConfig.supportedLngs);

  let accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  let refreshedTokens: Tokens | null = null;

  if (!accessToken && refreshToken) {
    refreshedTokens = await refreshTokensInMiddleware(refreshToken);
    if (refreshedTokens) {
      accessToken = refreshedTokens.accessToken;
      request.cookies.set(ACCESS_TOKEN_KEY, refreshedTokens.accessToken);
      request.cookies.set(REFRESH_TOKEN_KEY, refreshedTokens.refreshToken);
    }
  }

  const isAuthenticated = Boolean(accessToken || refreshToken);

  // Special cases
  if (normalizedPath === '/reset-password') {
    if (!searchParams.get('token')) {
      return NextResponse.redirect(new URL('/forgot-password', request.url));
    }
    return i18nProxy(request);
  }

  // Public
  if (isPublicAuthRoute(normalizedPath)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return i18nProxy(request);
  }

  // Private
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const response = i18nProxy(request);

  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );

  if (refreshedTokens) {
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set(ACCESS_TOKEN_KEY, refreshedTokens.accessToken, {
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
    });
    response.cookies.set(REFRESH_TOKEN_KEY, refreshedTokens.refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
      maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
};
