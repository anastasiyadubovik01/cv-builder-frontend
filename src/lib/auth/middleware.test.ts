import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { refreshTokensInMiddleware } from './middleware';

describe('refreshTokensInMiddleware', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv('NEXT_PUBLIC_GRAPHQL_URL', 'https://example.com/graphql');

    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns null when GraphQL URL is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_GRAPHQL_URL', '');

    const result = await refreshTokensInMiddleware('refresh-token');

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refreshes and returns new tokens', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: {
          updateToken: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
          },
        },
      }),
    });

    const result = await refreshTokensInMiddleware('old-refresh-token');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer old-refresh-token',
        },
      }),
    );

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('returns null when response is not successful', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
    });

    const result = await refreshTokensInMiddleware('refresh-token');

    expect(result).toBeNull();
  });

  it('returns null when response does not contain both tokens', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: {
          updateToken: {
            access_token: 'new-access-token',
          },
        },
      }),
    });

    const result = await refreshTokensInMiddleware('refresh-token');

    expect(result).toBeNull();
  });

  it('returns null when fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    const result = await refreshTokensInMiddleware('refresh-token');

    expect(result).toBeNull();
  });
});
