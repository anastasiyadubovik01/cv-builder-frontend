'use server';

import { cookies } from 'next/headers';
import { TOKEN_EXPIRY } from '@/lib/constants/auth';

interface SetTokensParams {
  accessToken: string;
  refreshToken: string;
}

export async function setAuthCookies({
  accessToken,
  refreshToken,
}: SetTokensParams) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY.ACCESS_TOKEN,
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_EXPIRY.REFRESH_TOKEN,
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}
