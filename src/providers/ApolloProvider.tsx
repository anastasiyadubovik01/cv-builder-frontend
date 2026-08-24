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
import { refreshAuthTokensAction, logoutAction } from '@/app/actions/auth';
import { AuthRefreshError } from '@/lib/error/errors';

const REFRESHED_OPERATION_CONTEXT = 'tokenRefreshed';
const UNAUTHENTICATED_CODE = 'UNAUTHENTICATED';

const IGNORED_AUTH_OPERATIONS = ['Login', 'SignUp', 'UpdateToken'];

function makeClient() {
  let isRefreshing = false;
  let pendingRequests: Array<(success: boolean) => void> = [];

  const processQueue = (success: boolean) => {
    pendingRequests.forEach((callback) => callback(success));
    pendingRequests = [];
  };

  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      logoutAction().finally(() => {
        window.location.replace('/sign-in');
      });
    }
  };

  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: 'include',
  });

  const setAuthHeader = (operation: ApolloLink.Operation) => {
    const token = getAccessToken();

    operation.setContext(
      ({ headers = {} }: { headers?: Record<string, string> }) => {
        const customAuth = headers.authorization || headers.Authorization;
        const authHeader = customAuth || (token ? `Bearer ${token}` : '');
        return {
          headers: {
            ...headers,
            ...(authHeader ? { authorization: authHeader } : {}),
          },
        };
      },
    );
  };

  // Access token to the request
  const authLink = new ApolloLink((operation, forward) => {
    setAuthHeader(operation);
    return forward(operation);
  });

  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (!CombinedGraphQLErrors.is(error)) return;

    const isUnauthenticated = error.errors.some(
      (graphQLError) => graphQLError.extensions?.code === UNAUTHENTICATED_CODE,
    );
    if (!isUnauthenticated) return;

    const isAuthOperation = IGNORED_AUTH_OPERATIONS.includes(
      operation.operationName as string,
    );
    if (isAuthOperation) return;

    const alreadyRefreshed =
      operation.getContext()[REFRESHED_OPERATION_CONTEXT] === true;
    if (alreadyRefreshed) {
      redirectToLogin();
      return;
    }

    operation.setContext({
      [REFRESHED_OPERATION_CONTEXT]: true,
    });

    return new Observable<ApolloLink.Result>((observer) => {
      let subscription: Subscription | undefined;

      if (!isRefreshing) {
        isRefreshing = true;

        refreshAuthTokensAction()
          .then((refreshed) => {
            isRefreshing = false;
            processQueue(refreshed);
            if (!refreshed) {
              redirectToLogin();
              observer.error(new AuthRefreshError());
              return;
            }
            setAuthHeader(operation);
            subscription = forward(operation).subscribe(observer);
          })
          .catch((err: unknown) => {
            isRefreshing = false;
            processQueue(false);
            redirectToLogin();
            observer.error(err);
          });
      } else {
        pendingRequests.push((success: boolean) => {
          if (success) {
            setAuthHeader(operation);
            subscription = forward(operation).subscribe(observer);
          } else {
            redirectToLogin();
            observer.error(new AuthRefreshError());
          }
        });
      }

      return () => {
        subscription?.unsubscribe();
      };
    });
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Cv: {
        fields: {
          projects: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  });

  // GraphQL client
  return new ApolloClient({
    cache,
    link: ApolloLink.from([authLink, errorLink, httpLink]),
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
