'use client';

import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { HttpLink, ApolloLink } from '@apollo/client';
import React from 'react';

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    credentials: 'include',
  });

  const authLink = new ApolloLink((operation, forward) => {
    const token = getCookie('access_token');

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

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),
  });
}

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
