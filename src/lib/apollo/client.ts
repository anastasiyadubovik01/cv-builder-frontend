import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_KEY } from '@/lib/auth/tokenUtils';
import { createAuthHeader } from '@/lib/auth/authUtils';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  });

  const authLink = new SetContextLink(async (prevContext) => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_KEY)?.value;

    return {
      headers: {
        ...(prevContext.headers || {}),
        ...createAuthHeader(accessToken),
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
