'use server';

import { cookies } from 'next/headers';
import { TOKEN_EXPIRY } from '@/lib/constants/auth';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/auth/tokenUtils';

interface SetTokensParams {
  accessToken: string;
  refreshToken: string;
}

export async function setAuthCookies({
  accessToken,
  refreshToken,
}: SetTokensParams) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
  });

  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
  });
}

export async function refreshAuthTokensAction(): Promise<boolean> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_KEY)?.value;
  if (!refreshToken) return false;

  try {
    const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
    if (!graphqlUrl) return false;

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

    if (!res.ok) return false;

    const json = await res.json();
    const tokens = json.data?.updateToken;

    if (!tokens?.access_token || !tokens?.refresh_token) {
      return false;
    }

    await setAuthCookies({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    return true;
  } catch {
    return false;
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
}
