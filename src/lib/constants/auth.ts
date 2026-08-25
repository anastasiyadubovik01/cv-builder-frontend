export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 15 * 60,
  REFRESH_TOKEN: 7 * 24 * 60 * 60,
} as const;

export const PUBLIC_AUTH_ROUTES = ['/sign-in', '/sign-up', '/forgot-password'];
export const IGNORED_AUTH_OPERATIONS = ['Login', 'SignUp', 'UpdateToken'];
export const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED';
