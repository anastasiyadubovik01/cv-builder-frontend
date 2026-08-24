import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createProxy } from 'next-i18next/proxy';
import i18nConfig from '../i18n.config';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/auth/tokenUtils';
import { TOKEN_EXPIRY } from '@/lib/constants/auth';

const i18nProxy = createProxy(i18nConfig);

const PUBLIC_AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];

function stripLocalePrefix(pathname: string): string {
  const locales = i18nConfig.supportedLngs;
  const segments = pathname.split('/');
  if (segments[1] && locales.includes(segments[1])) {
    const stripped = '/' + segments.slice(2).join('/');
    return stripped === '/' ? '/' : stripped.replace(/\/$/, '');
  }
  return pathname;
}

async function refreshTokensInMiddleware(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
    if (!graphqlUrl) return null;

    const res = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({
        query: `
          mutation UpdateToken {
            updateToken {
              access_token
              refresh_token
            }
          }
        `,
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const tokens = json.data?.updateToken;

    if (tokens?.access_token && tokens?.refresh_token) {
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const normalizedPath = stripLocalePrefix(pathname);

  let accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  let refreshedTokens: { accessToken: string; refreshToken: string } | null =
    null;

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
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      return NextResponse.redirect(new URL('/forgot-password', request.url));
    }
    return i18nProxy(request);
  }

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
    (route) =>
      normalizedPath === route || normalizedPath.startsWith(`${route}/`),
  );

  // Public
  if (isPublicAuthRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return i18nProxy(request);
  }

  // verify-email?

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
    response.cookies.set(ACCESS_TOKEN_KEY, refreshedTokens.accessToken, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
    });
    response.cookies.set(REFRESH_TOKEN_KEY, refreshedTokens.refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
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
