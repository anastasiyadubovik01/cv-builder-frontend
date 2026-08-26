export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export async function refreshTokensInMiddleware(
  refreshToken: string,
): Promise<Tokens | null> {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (!graphqlUrl) return null;

  try {
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
