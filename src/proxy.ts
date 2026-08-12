import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createProxy } from 'next-i18next/proxy';
import i18nConfig from '../i18n.config';

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = stripLocalePrefix(pathname);

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthenticated = Boolean(accessToken || refreshToken);

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

  // verify-email & reset-password?

  // Private
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return i18nProxy(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
};
