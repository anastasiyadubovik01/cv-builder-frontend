'use client';

import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { HttpLink, ApolloLink, Observable } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import { SetContextLink } from '@apollo/client/link/context';
import React from 'react';
import { getAccessToken } from '@/lib/auth/tokenUtils';
import { refreshAuthTokensAction, logoutAction } from '@/app/actions/auth';
import { AuthRefreshError } from '@/lib/error/errors';
import {
  createAuthHeader,
  isUnauthenticatedError,
  isIgnoredAuthOperation,
} from '@/lib/auth/authUtils';

const REFRESHED_OPERATION_CONTEXT = 'tokenRefreshed';

class TokenRefreshQueue {
  private isRefreshing = false;
  private pendingRequests: Array<(success: boolean) => void> = [];

  private processQueue(success: boolean) {
    this.pendingRequests.forEach((callback) => callback(success));
    this.pendingRequests = [];
  }

  public redirectToLogin() {
    if (typeof window !== 'undefined') {
      logoutAction().finally(() => {
        window.location.replace('/sign-in');
      });
    }
  }

  public handleRefresh(onSuccess: () => void, onError: (err: unknown) => void) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      refreshAuthTokensAction()
        .then((refreshed) => {
          this.isRefreshing = false;
          this.processQueue(refreshed);
          if (!refreshed) {
            this.redirectToLogin();
            onError(new AuthRefreshError());
            return;
          }
          onSuccess();
        })
        .catch((err: unknown) => {
          this.isRefreshing = false;
          this.processQueue(false);
          this.redirectToLogin();
          onError(err);
        });
    } else {
      this.pendingRequests.push((success: boolean) => {
        if (success) {
          onSuccess();
        } else {
          this.redirectToLogin();
          onError(new AuthRefreshError());
        }
      });
    }
  }
}

const tokenRefreshQueue = new TokenRefreshQueue();

const applyCurrentTokenToOperation = (operation: ApolloLink.Operation) => {
  const token = getAccessToken();
  operation.setContext(
    ({ headers = {} }: { headers?: Record<string, string> }) => ({
      headers: {
        ...headers,
        ...createAuthHeader(token),
      },
    }),
  );
};

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: 'include',
  });

  const authLink = new SetContextLink((prevContext) => {
    const token = getAccessToken();
    const headers = prevContext.headers || {};
    const customAuth = headers.authorization || headers.Authorization;

    return {
      headers: {
        ...headers,
        ...(customAuth
          ? { authorization: customAuth }
          : createAuthHeader(token)),
      },
    };
  });

  const errorLink = new ErrorLink(({ error, operation, forward }) => {
    if (!CombinedGraphQLErrors.is(error)) return;
    if (!isUnauthenticatedError(error.errors)) return;
    if (isIgnoredAuthOperation(operation.operationName)) return;

    const alreadyRefreshed =
      operation.getContext()[REFRESHED_OPERATION_CONTEXT] === true;

    if (alreadyRefreshed) {
      tokenRefreshQueue.redirectToLogin();
      return;
    }

    operation.setContext({
      [REFRESHED_OPERATION_CONTEXT]: true,
    });

    return new Observable<ApolloLink.Result>((observer) => {
      let subscription: { unsubscribe: () => void } | undefined;

      const retryOperation = () => {
        applyCurrentTokenToOperation(operation);
        subscription = forward(operation).subscribe(observer);
      };

      tokenRefreshQueue.handleRefresh(
        () => retryOperation(),
        (err) => observer.error(err),
      );

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
