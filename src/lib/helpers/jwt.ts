interface JwtPayload {
  sub?: number | string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

function decodeJwt<T = JwtPayload>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

export function getEmailFromJwt(token: string): string | null {
  const payload = decodeJwt(token);
  return payload?.email || null;
}

export function getRoleFromJwt(token: string): string | null {
  const payload = decodeJwt(token);
  return payload?.role || null;
}

export function getUserIdFromJwt(token: string): string | null {
  const payload = decodeJwt(token);

  if (payload?.sub === undefined) {
    return null;
  }

  return String(payload.sub);
}
