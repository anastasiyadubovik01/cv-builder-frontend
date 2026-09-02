import type { ReactElement, ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAuthHeader,
  isIgnoredAuthOperation,
  isUnauthenticatedError,
} from '@/lib/auth/authUtils';
import { getAccessToken } from '@/lib/auth/tokenUtils';
import { logoutAction, refreshAuthTokensAction } from '@/app/actions/auth';
import { AuthRefreshError } from '@/lib/error/errors';

import { ApolloProvider } from './ApolloProvider';

type HeaderContext = {
  headers?: Record<string, string>;
};

type ObserverLike = {
  next?: (value: unknown) => void;
  error: (error: unknown) => void;
  complete?: () => void;
};

type OperationLike = {
  operationName: string;
  getContext: () => Record<string, unknown>;
  setContext: (
    context:
      | Record<string, unknown>
      | ((
          previous: HeaderContext & Record<string, unknown>,
        ) => Record<string, unknown>),
  ) => void;
};

type ForwardResult = {
  subscribe: (observer: ObserverLike) => {
    unsubscribe: () => void;
  };
};

type ErrorHandlerArgs = {
  error: unknown;
  operation: OperationLike;
  forward: (operation: OperationLike) => ForwardResult;
};

const mocks = vi.hoisted(() => {
  let capturedMakeClient: (() => unknown) | undefined;

  let authHandler:
    | ((context: HeaderContext) => Promise<HeaderContext> | HeaderContext)
    | undefined;

  let errorHandler: ((args: ErrorHandlerArgs) => unknown) | undefined;

  const ApolloNextAppProvider = vi.fn(
    ({
      children,
      makeClient,
    }: {
      children: ReactNode;
      makeClient: () => unknown;
    }) => {
      capturedMakeClient = makeClient;

      return children as ReactElement;
    },
  );

  const HttpLink = vi.fn(function (
    this: { options?: unknown },
    options: unknown,
  ) {
    this.options = options;
  });

  const InMemoryCache = vi.fn(function (
    this: { options?: unknown },
    options?: unknown,
  ) {
    this.options = options;
  });

  const ApolloClient = vi.fn(function (
    this: { options?: unknown },
    options: unknown,
  ) {
    this.options = options;
  });

  const SetContextLink = vi.fn(function (
    this: object,
    handler: (context: HeaderContext) => Promise<HeaderContext> | HeaderContext,
  ) {
    authHandler = handler;
  });

  const ErrorLink = vi.fn(function (
    this: object,
    handler: (args: ErrorHandlerArgs) => unknown,
  ) {
    errorHandler = handler;
  });

  const apolloLinkFrom = vi.fn(() => 'combined-link');

  const Observable = vi.fn(function (
    this: {
      subscribe?: (observer: ObserverLike) => {
        unsubscribe: () => void;
      };
    },
    subscriber: (observer: ObserverLike) => void | (() => void),
  ) {
    this.subscribe = (observer: ObserverLike) => {
      const cleanup = subscriber(observer);

      return {
        unsubscribe: vi.fn(() => {
          cleanup?.();
        }),
      };
    };
  });

  const combinedGraphQLErrorsIs = vi.fn();

  return {
    ApolloNextAppProvider,
    HttpLink,
    InMemoryCache,
    ApolloClient,
    SetContextLink,
    ErrorLink,
    apolloLinkFrom,
    Observable,
    combinedGraphQLErrorsIs,

    getMakeClient: () => capturedMakeClient,
    getAuthHandler: () => authHandler,
    getErrorHandler: () => errorHandler,
  };
});

vi.mock('@apollo/client-integration-nextjs', () => ({
  ApolloNextAppProvider: mocks.ApolloNextAppProvider,
  ApolloClient: mocks.ApolloClient,
  InMemoryCache: mocks.InMemoryCache,
}));

vi.mock('@apollo/client', () => ({
  HttpLink: mocks.HttpLink,
  ApolloLink: {
    from: mocks.apolloLinkFrom,
  },
  Observable: mocks.Observable,
}));

vi.mock('@apollo/client/link/context', () => ({
  SetContextLink: mocks.SetContextLink,
}));

vi.mock('@apollo/client/link/error', () => ({
  ErrorLink: mocks.ErrorLink,
}));

vi.mock('@apollo/client/errors', () => ({
  CombinedGraphQLErrors: {
    is: mocks.combinedGraphQLErrorsIs,
  },
}));

vi.mock('@/lib/auth/tokenUtils', () => ({
  getAccessToken: vi.fn(),
}));

vi.mock('@/lib/auth/authUtils', () => ({
  createAuthHeader: vi.fn(),
  isUnauthenticatedError: vi.fn(),
  isIgnoredAuthOperation: vi.fn(),
}));

vi.mock('@/app/actions/auth', () => ({
  refreshAuthTokensAction: vi.fn(),
  logoutAction: vi.fn(),
}));

function renderProvider() {
  render(
    <ApolloProvider>
      <div>Application</div>
    </ApolloProvider>,
  );
}

function createOperation(
  initialContext: Record<string, unknown> = {},
): OperationLike & {
  setContext: ReturnType<typeof vi.fn>;
  getContext: ReturnType<typeof vi.fn>;
} {
  let context = { ...initialContext };

  const getContext = vi.fn(() => context);

  const setContext = vi.fn(
    (
      next:
        | Record<string, unknown>
        | ((
            previous: HeaderContext & Record<string, unknown>,
          ) => Record<string, unknown>),
    ) => {
      const update = typeof next === 'function' ? next(context) : next;

      context = {
        ...context,
        ...update,
      };
    },
  );

  return {
    operationName: 'CurrentUser',
    getContext,
    setContext,
  };
}

function createForward() {
  const unsubscribe = vi.fn();

  const subscribe = vi.fn(() => ({
    unsubscribe,
  }));

  const forward = vi.fn(() => ({
    subscribe,
  }));

  return {
    forward,
    subscribe,
    unsubscribe,
  };
}

function makeApolloClient() {
  renderProvider();

  const makeClient = mocks.getMakeClient();

  expect(makeClient).toEqual(expect.any(Function));

  makeClient?.();
}

describe('ApolloProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getAccessToken).mockReturnValue('access-token');

    vi.mocked(createAuthHeader).mockReturnValue({
      authorization: 'Bearer access-token',
    });

    vi.mocked(isUnauthenticatedError).mockReturnValue(false);

    vi.mocked(isIgnoredAuthOperation).mockReturnValue(false);

    vi.mocked(refreshAuthTokensAction).mockResolvedValue(true);

    vi.mocked(logoutAction).mockResolvedValue(undefined);

    mocks.combinedGraphQLErrorsIs.mockReturnValue(true);

    mocks.apolloLinkFrom.mockReturnValue('combined-link');
  });

  it('renders children inside Apollo provider', () => {
    renderProvider();

    expect(screen.getByText('Application')).toBeInTheDocument();

    expect(mocks.ApolloNextAppProvider).toHaveBeenCalled();
  });

  it('creates Apollo client with HTTP link, cache and composed links', () => {
    makeApolloClient();

    expect(mocks.HttpLink).toHaveBeenCalledWith({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
      credentials: 'include',
    });

    expect(mocks.SetContextLink).toHaveBeenCalledTimes(1);
    expect(mocks.ErrorLink).toHaveBeenCalledTimes(1);
    expect(mocks.InMemoryCache).toHaveBeenCalledTimes(1);
    expect(mocks.apolloLinkFrom).toHaveBeenCalledTimes(1);

    expect(mocks.ApolloClient).toHaveBeenCalledWith({
      cache: expect.any(Object),
      link: 'combined-link',
    });
  });

  it('adds current access token to request headers', async () => {
    makeApolloClient();

    const authHandler = mocks.getAuthHandler();

    expect(authHandler).toBeDefined();

    const result = await authHandler?.({
      headers: {
        'x-request-id': '123',
      },
    });

    expect(getAccessToken).toHaveBeenCalledTimes(1);

    expect(createAuthHeader).toHaveBeenCalledWith('access-token');

    expect(result).toEqual({
      headers: {
        'x-request-id': '123',
        authorization: 'Bearer access-token',
      },
    });
  });

  it('adds token when previous headers are missing', async () => {
    makeApolloClient();

    const authHandler = mocks.getAuthHandler();

    const result = await authHandler?.({});

    expect(result).toEqual({
      headers: {
        authorization: 'Bearer access-token',
      },
    });
  });

  it('preserves custom authorization header instead of replacing it', async () => {
    makeApolloClient();

    const authHandler = mocks.getAuthHandler();

    const result = await authHandler?.({
      headers: {
        authorization: 'Bearer custom-token',
        'x-request-id': '123',
      },
    });

    expect(result).toEqual({
      headers: {
        authorization: 'Bearer custom-token',
        'x-request-id': '123',
      },
    });

    expect(createAuthHeader).not.toHaveBeenCalled();
  });

  it('supports custom Authorization header with uppercase name', async () => {
    makeApolloClient();

    const authHandler = mocks.getAuthHandler();

    const result = await authHandler?.({
      headers: {
        Authorization: 'Bearer custom-token',
      },
    });

    expect(result).toEqual({
      headers: {
        Authorization: 'Bearer custom-token',
        authorization: 'Bearer custom-token',
      },
    });

    expect(createAuthHeader).not.toHaveBeenCalled();
  });

  it('returns incoming CV projects instead of merging old cache data', () => {
    makeApolloClient();

    const cacheOptions = mocks.InMemoryCache.mock.calls[0][0] as {
      typePolicies: {
        Cv: {
          fields: {
            projects: {
              merge: (existing: unknown, incoming: unknown) => unknown;
            };
          };
        };
      };
    };

    const merge = cacheOptions.typePolicies.Cv.fields.projects.merge;

    const incoming = [
      {
        id: 'project-2',
      },
    ];

    const result = merge(
      [
        {
          id: 'project-1',
        },
      ],
      incoming,
    );

    expect(result).toBe(incoming);
  });

  it('ignores errors that are not combined GraphQL errors', () => {
    makeApolloClient();

    mocks.combinedGraphQLErrorsIs.mockReturnValue(false);

    const errorHandler = mocks.getErrorHandler();

    const operation = createOperation();
    const { forward } = createForward();

    const result = errorHandler?.({
      error: new Error('Network error'),
      operation,
      forward,
    });

    expect(result).toBeUndefined();

    expect(isUnauthenticatedError).not.toHaveBeenCalled();

    expect(refreshAuthTokensAction).not.toHaveBeenCalled();
  });

  it('ignores GraphQL errors that are not authentication errors', () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(false);

    const errorHandler = mocks.getErrorHandler();

    const operation = createOperation();
    const { forward } = createForward();

    const error = {
      errors: [
        {
          message: 'Validation error',
        },
      ],
    };

    const result = errorHandler?.({
      error,
      operation,
      forward,
    });

    expect(isUnauthenticatedError).toHaveBeenCalledWith(error.errors);

    expect(result).toBeUndefined();

    expect(refreshAuthTokensAction).not.toHaveBeenCalled();
  });

  it('does not refresh token for ignored auth operations', () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(true);

    vi.mocked(isIgnoredAuthOperation).mockReturnValue(true);

    const errorHandler = mocks.getErrorHandler();

    const operation = createOperation();
    operation.operationName = 'Login';

    const { forward } = createForward();

    const error = {
      errors: [
        {
          message: 'Unauthorized',
        },
      ],
    };

    const result = errorHandler?.({
      error,
      operation,
      forward,
    });

    expect(isIgnoredAuthOperation).toHaveBeenCalledWith('Login');

    expect(result).toBeUndefined();

    expect(refreshAuthTokensAction).not.toHaveBeenCalled();
  });

  it('refreshes token and retries unauthenticated operation', async () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(true);

    vi.mocked(isIgnoredAuthOperation).mockReturnValue(false);

    vi.mocked(getAccessToken).mockReturnValue('new-access-token');

    vi.mocked(createAuthHeader).mockReturnValue({
      authorization: 'Bearer new-access-token',
    });

    const errorHandler = mocks.getErrorHandler();

    const operation = createOperation();

    const { forward, subscribe, unsubscribe } = createForward();

    const error = {
      errors: [
        {
          message: 'Unauthenticated',
        },
      ],
    };

    const observable = errorHandler?.({
      error,
      operation,
      forward,
    }) as {
      subscribe: (observer: ObserverLike) => {
        unsubscribe: () => void;
      };
    };

    expect(operation.setContext).toHaveBeenCalledWith({
      tokenRefreshed: true,
    });

    const observer = {
      error: vi.fn(),
    };

    const subscription = observable.subscribe(observer);

    await waitFor(() => {
      expect(refreshAuthTokensAction).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(forward).toHaveBeenCalledWith(operation);
    });

    expect(getAccessToken).toHaveBeenCalled();

    expect(createAuthHeader).toHaveBeenCalledWith('new-access-token');

    expect(operation.setContext).toHaveBeenCalledWith(expect.any(Function));

    expect(subscribe).toHaveBeenCalledWith(observer);

    subscription.unsubscribe();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('queues multiple failed requests while token refresh is in progress', async () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(true);

    vi.mocked(isIgnoredAuthOperation).mockReturnValue(false);

    let resolveRefresh: ((value: boolean) => void) | undefined;

    const refreshPromise = new Promise<boolean>((resolve) => {
      resolveRefresh = resolve;
    });

    vi.mocked(refreshAuthTokensAction).mockReturnValue(refreshPromise);

    const errorHandler = mocks.getErrorHandler();

    const firstOperation = createOperation();
    const secondOperation = createOperation();

    const firstForward = createForward();
    const secondForward = createForward();

    const error = {
      errors: [
        {
          message: 'Unauthenticated',
        },
      ],
    };

    const firstObservable = errorHandler?.({
      error,
      operation: firstOperation,
      forward: firstForward.forward,
    }) as {
      subscribe: (observer: ObserverLike) => unknown;
    };

    const secondObservable = errorHandler?.({
      error,
      operation: secondOperation,
      forward: secondForward.forward,
    }) as {
      subscribe: (observer: ObserverLike) => unknown;
    };

    firstObservable.subscribe({
      error: vi.fn(),
    });

    secondObservable.subscribe({
      error: vi.fn(),
    });

    expect(refreshAuthTokensAction).toHaveBeenCalledTimes(1);

    expect(firstForward.forward).not.toHaveBeenCalled();

    expect(secondForward.forward).not.toHaveBeenCalled();

    resolveRefresh?.(true);

    await waitFor(() => {
      expect(firstForward.forward).toHaveBeenCalledWith(firstOperation);

      expect(secondForward.forward).toHaveBeenCalledWith(secondOperation);
    });

    expect(refreshAuthTokensAction).toHaveBeenCalledTimes(1);
  });

  it('redirects to login when already refreshed operation fails again', async () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(true);

    const errorHandler = mocks.getErrorHandler();

    const operation = createOperation({
      tokenRefreshed: true,
    });

    const { forward } = createForward();

    const error = {
      errors: [
        {
          message: 'Unauthenticated',
        },
      ],
    };

    const result = errorHandler?.({
      error,
      operation,
      forward,
    });

    expect(result).toBeUndefined();

    expect(refreshAuthTokensAction).not.toHaveBeenCalled();

    expect(logoutAction).toHaveBeenCalledTimes(1);

    await Promise.resolve();
  });

  it('reports AuthRefreshError when refresh returns false', async () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(true);

    vi.mocked(refreshAuthTokensAction).mockResolvedValue(false);

    const errorHandler = mocks.getErrorHandler();

    const operation = createOperation();
    const { forward } = createForward();

    const error = {
      errors: [
        {
          message: 'Unauthenticated',
        },
      ],
    };

    const observable = errorHandler?.({
      error,
      operation,
      forward,
    }) as {
      subscribe: (observer: ObserverLike) => unknown;
    };

    const observer = {
      error: vi.fn(),
    };

    observable.subscribe(observer);

    await waitFor(() => {
      expect(observer.error).toHaveBeenCalledTimes(1);
    });

    expect(forward).not.toHaveBeenCalled();

    expect(observer.error.mock.calls[0][0]).toBeInstanceOf(AuthRefreshError);

    expect(logoutAction).toHaveBeenCalledTimes(1);
  });

  it('reports original error when token refresh throws', async () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(true);

    const refreshError = new Error('Refresh failed');

    vi.mocked(refreshAuthTokensAction).mockRejectedValue(refreshError);

    const errorHandler = mocks.getErrorHandler();

    const operation = createOperation();
    const { forward } = createForward();

    const error = {
      errors: [
        {
          message: 'Unauthenticated',
        },
      ],
    };

    const observable = errorHandler?.({
      error,
      operation,
      forward,
    }) as {
      subscribe: (observer: ObserverLike) => unknown;
    };

    const observer = {
      error: vi.fn(),
    };

    observable.subscribe(observer);

    await waitFor(() => {
      expect(observer.error).toHaveBeenCalledWith(refreshError);
    });

    expect(forward).not.toHaveBeenCalled();

    expect(logoutAction).toHaveBeenCalledTimes(1);
  });

  it('reports AuthRefreshError to queued requests when refresh fails', async () => {
    makeApolloClient();

    vi.mocked(isUnauthenticatedError).mockReturnValue(true);

    let resolveRefresh: ((value: boolean) => void) | undefined;

    const refreshPromise = new Promise<boolean>((resolve) => {
      resolveRefresh = resolve;
    });

    vi.mocked(refreshAuthTokensAction).mockReturnValue(refreshPromise);

    const errorHandler = mocks.getErrorHandler();

    const firstOperation = createOperation();
    const secondOperation = createOperation();

    const firstForward = createForward();
    const secondForward = createForward();

    const error = {
      errors: [
        {
          message: 'Unauthenticated',
        },
      ],
    };

    const firstObservable = errorHandler?.({
      error,
      operation: firstOperation,
      forward: firstForward.forward,
    }) as {
      subscribe: (observer: ObserverLike) => unknown;
    };

    const secondObservable = errorHandler?.({
      error,
      operation: secondOperation,
      forward: secondForward.forward,
    }) as {
      subscribe: (observer: ObserverLike) => unknown;
    };

    const firstObserver = {
      error: vi.fn(),
    };

    const secondObserver = {
      error: vi.fn(),
    };

    firstObservable.subscribe(firstObserver);
    secondObservable.subscribe(secondObserver);

    expect(refreshAuthTokensAction).toHaveBeenCalledTimes(1);

    resolveRefresh?.(false);

    await waitFor(() => {
      expect(firstObserver.error).toHaveBeenCalledTimes(1);

      expect(secondObserver.error).toHaveBeenCalledTimes(1);
    });

    expect(firstForward.forward).not.toHaveBeenCalled();

    expect(secondForward.forward).not.toHaveBeenCalled();

    expect(firstObserver.error.mock.calls[0][0]).toBeInstanceOf(
      AuthRefreshError,
    );

    expect(secondObserver.error.mock.calls[0][0]).toBeInstanceOf(
      AuthRefreshError,
    );

    expect(logoutAction).toHaveBeenCalledTimes(2);
  });
});
