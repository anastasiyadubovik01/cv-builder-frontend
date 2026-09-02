import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ACCESS_TOKEN_KEY } from '@/lib/auth/tokenUtils';
import { createAuthHeader } from '@/lib/auth/authUtils';

const mocks = vi.hoisted(() => {
  let apolloFactory: (() => unknown) | undefined;
  let contextHandler:
    | ((context: { headers?: Record<string, string> }) => Promise<unknown>)
    | undefined;

  const concat = vi.fn();

  const registerApolloClient = vi.fn((factory: () => unknown) => {
    apolloFactory = factory;

    return {
      getClient: vi.fn(),
      query: vi.fn(),
      PreloadQuery: vi.fn(),
    };
  });

  const HttpLink = vi.fn(function (
    this: { options?: unknown },
    options: unknown,
  ) {
    this.options = options;
  });

  const InMemoryCache = vi.fn(function (this: object) {
    return this;
  });

  const SetContextLink = vi.fn(function (
    this: {
      concat?: typeof concat;
    },
    handler: (context: {
      headers?: Record<string, string>;
    }) => Promise<unknown>,
  ) {
    contextHandler = handler;
    this.concat = concat;
  });

  const ApolloClient = vi.fn(function (
    this: {
      options?: unknown;
    },
    options: unknown,
  ) {
    this.options = options;
  });

  const cookies = vi.fn();

  return {
    getApolloFactory: () => apolloFactory,
    getContextHandler: () => contextHandler,

    registerApolloClient,
    HttpLink,
    InMemoryCache,
    SetContextLink,
    ApolloClient,
    concat,
    cookies,
  };
});

vi.mock('@apollo/client-integration-nextjs', () => ({
  registerApolloClient: mocks.registerApolloClient,
  ApolloClient: mocks.ApolloClient,
  InMemoryCache: mocks.InMemoryCache,
}));

vi.mock('@apollo/client', () => ({
  HttpLink: mocks.HttpLink,
}));

vi.mock('@apollo/client/link/context', () => ({
  SetContextLink: mocks.SetContextLink,
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}));

vi.mock('@/lib/auth/authUtils', () => ({
  createAuthHeader: vi.fn(),
}));

import { getClient, PreloadQuery, query } from './client';

describe('apollo client', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.concat.mockReturnValue('combined-link');

    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({
        value: 'access-token',
      }),
    });

    vi.mocked(createAuthHeader).mockReturnValue({
      authorization: 'Bearer access-token',
    });
  });

  it('exposes Apollo client factory and helpers', () => {
    expect(mocks.getApolloFactory()).toEqual(expect.any(Function));

    expect(getClient).toEqual(expect.any(Function));
    expect(query).toEqual(expect.any(Function));
    expect(PreloadQuery).toEqual(expect.any(Function));
  });

  it('creates Apollo client with cache and combined links', () => {
    const factory = mocks.getApolloFactory();

    expect(factory).toBeDefined();

    factory?.();

    expect(mocks.HttpLink).toHaveBeenCalledWith({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
    });

    expect(mocks.InMemoryCache).toHaveBeenCalledTimes(1);

    expect(mocks.SetContextLink).toHaveBeenCalledTimes(1);

    expect(mocks.concat).toHaveBeenCalledTimes(1);

    expect(mocks.ApolloClient).toHaveBeenCalledWith({
      cache: expect.any(Object),
      link: 'combined-link',
    });
  });

  it('reads access token from cookies and creates auth header', async () => {
    const cookieGet = vi.fn().mockReturnValue({
      value: 'access-token',
    });

    mocks.cookies.mockResolvedValue({
      get: cookieGet,
    });

    const factory = mocks.getApolloFactory();

    factory?.();

    const contextHandler = mocks.getContextHandler();

    expect(contextHandler).toBeDefined();

    await contextHandler?.({
      headers: {},
    });

    expect(mocks.cookies).toHaveBeenCalledTimes(1);

    expect(cookieGet).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);

    expect(createAuthHeader).toHaveBeenCalledWith('access-token');
  });

  it('preserves previous headers and adds auth header', async () => {
    const factory = mocks.getApolloFactory();

    factory?.();

    const contextHandler = mocks.getContextHandler();

    const result = await contextHandler?.({
      headers: {
        'x-request-id': 'request-123',
      },
    });

    expect(result).toEqual({
      headers: {
        'x-request-id': 'request-123',
        authorization: 'Bearer access-token',
      },
    });
  });

  it('works when previous context has no headers', async () => {
    const factory = mocks.getApolloFactory();

    factory?.();

    const contextHandler = mocks.getContextHandler();

    const result = await contextHandler?.({});

    expect(result).toEqual({
      headers: {
        authorization: 'Bearer access-token',
      },
    });
  });

  it('handles missing access token', async () => {
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    vi.mocked(createAuthHeader).mockReturnValue({});

    const factory = mocks.getApolloFactory();

    factory?.();

    const contextHandler = mocks.getContextHandler();

    const result = await contextHandler?.({
      headers: {
        'x-request-id': 'request-123',
      },
    });

    expect(createAuthHeader).toHaveBeenCalledWith(undefined);

    expect(result).toEqual({
      headers: {
        'x-request-id': 'request-123',
      },
    });
  });
});
