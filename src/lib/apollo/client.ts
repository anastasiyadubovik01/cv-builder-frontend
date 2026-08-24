import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { HttpLink, ApolloLink, Observable } from '@apollo/client';
import { cookies } from 'next/headers';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  });

  const authLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      cookies()
        .then((cookieStore) => {
          const accessToken = cookieStore.get('access_token')?.value;
          operation.setContext(
            ({ headers = {} }: { headers?: Record<string, string> }) => ({
              headers: {
                ...headers,
                ...(accessToken
                  ? { authorization: `Bearer ${accessToken}` }
                  : {}),
              },
            }),
          );
        })
        .then(() => {
          const sub = forward(operation).subscribe(observer);
          return () => sub.unsubscribe();
        })
        .catch((err: unknown) => {
          observer.error(err);
        });
    });
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
});
