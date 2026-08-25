import type { GraphQLFormattedError } from 'graphql';
import {
  PUBLIC_AUTH_ROUTES,
  UNAUTHENTICATED_CODE,
  IGNORED_AUTH_OPERATIONS,
} from '@/lib/constants/auth';

export function isUnauthenticatedError(
  errors: readonly GraphQLFormattedError[] = [],
): boolean {
  return errors.some((err) => err.extensions?.code === UNAUTHENTICATED_CODE);
}

export function isIgnoredAuthOperation(operationName?: string): boolean {
  if (!operationName) return false;
  return IGNORED_AUTH_OPERATIONS.includes(operationName);
}

export function stripLocalePrefix(
  pathname: string,
  supportedLngs: readonly string[],
): string {
  const segments = pathname.split('/');
  if (segments[1] && supportedLngs.includes(segments[1])) {
    const stripped = '/' + segments.slice(2).join('/');
    return stripped === '/' ? '/' : stripped.replace(/\/$/, '');
  }
  return pathname;
}

export function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function createAuthHeader(
  token?: string | null,
): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}
