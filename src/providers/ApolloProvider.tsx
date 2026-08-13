'use client';

import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { HttpLink, ApolloLink, Observable } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import React from 'react';
import type { Subscription } from 'rxjs';
import { getAccessToken } from '@/lib/auth/tokenUtils';
import { refreshAuthTokensAction } from '@/app/actions/auth';
import { AuthRefreshError } from '@/lib/constants/errors';

const REFRESHED_OPERATION_CONTEXT = 'tokenRefreshed';
const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED';

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: 'include',
  });

  // Unauthenticated GraphQL errors
  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (!CombinedGraphQLErrors.is(error)) return;

    const isUnauthenticated = error.errors.some(
      (graphQLError) => graphQLError.extensions?.code === UNAUTHENTICATED_CODE,
    );
    if (!isUnauthenticated) return;

    const alreadyRefreshed =
      operation.getContext()[REFRESHED_OPERATION_CONTEXT] === true;
    if (alreadyRefreshed) return;

    operation.setContext({
      [REFRESHED_OPERATION_CONTEXT]: true,
    });

    return new Observable<ApolloLink.Result>((observer) => {
      let subscription: Subscription | undefined;

      refreshAuthTokensAction()
        .then((refreshed) => {
          if (!refreshed) {
            observer.error(new AuthRefreshError());
            return;
          }
          subscription = forward(operation).subscribe(observer);
        })
        .catch((error) => {
          observer.error(error);
        });

      return () => {
        subscription?.unsubscribe();
      };
    });
  });

  // Access token to the request
  const authLink = new ApolloLink((operation, forward) => {
    const token = getAccessToken();

    operation.setContext(({ headers = {} }) => {
      const customAuth = headers.authorization || headers.Authorization;
      const authHeader = customAuth || (token ? `Bearer ${token}` : '');
      return {
        headers: {
          ...headers,
          ...(authHeader ? { authorization: authHeader } : {}),
        },
      };
    });

    return forward(operation);
  });

  // GraphQL client
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: errorLink.concat(authLink).concat(httpLink),
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
