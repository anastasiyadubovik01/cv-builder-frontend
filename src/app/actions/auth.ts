'use server';

import { cookies } from 'next/headers';
import { TOKEN_EXPIRY } from '@/lib/constants/auth';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/auth/tokenUtils';
import { getClient } from '@/lib/apollo/client';
import { UPDATE_TOKEN_MUTATION, type UpdateTokenResponse } from '@/api/auth';

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
    const client = getClient();

    const { data } = await client.mutate<UpdateTokenResponse>({
      mutation: UPDATE_TOKEN_MUTATION,
      context: {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    });

    const tokens = data?.updateToken;
    if (!tokens) return false;

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
