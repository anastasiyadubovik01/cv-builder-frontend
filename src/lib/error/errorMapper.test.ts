import { describe, it, expect } from 'vitest';
import { mapServerError, DEFAULT_ERROR_MAPPING } from '@/lib/error/errorMapper';
import { AuthRefreshError, SERVER_ERROR_CODES } from '@/lib/error/errors';

describe('errorMapper', () => {
  it('maps AuthRefreshError to the correct client error translation key', () => {
    const error = new AuthRefreshError();
    const result = mapServerError(error);
    expect(result).toBe('auth.errors.authRefreshFailed');
  });

  it('maps known server error instances based on error message containing code', () => {
    const error = new Error(
      `Request failed with code ${SERVER_ERROR_CODES.USER_ALREADY_EXISTS}`,
    );
    const result = mapServerError(error);
    expect(result).toBe(
      DEFAULT_ERROR_MAPPING[SERVER_ERROR_CODES.USER_ALREADY_EXISTS],
    );
  });

  it('is case-insensitive when checking server error codes in error message', () => {
    const error = new Error(
      SERVER_ERROR_CODES.INVALID_CREDENTIALS.toUpperCase(),
    );
    const result = mapServerError(error);
    expect(result).toBe(
      DEFAULT_ERROR_MAPPING[SERVER_ERROR_CODES.INVALID_CREDENTIALS],
    );
  });

  it('allows overriding or extending mappings via customMapping', () => {
    const customError = new Error(
      `Error with code ${SERVER_ERROR_CODES.USER_ALREADY_EXISTS}`,
    );
    const result = mapServerError(customError, {
      [SERVER_ERROR_CODES.USER_ALREADY_EXISTS]: 'custom.userExists',
    });
    expect(result).toBe('custom.userExists');
  });

  it('returns default unknown error key if error is not an Error instance', () => {
    expect(mapServerError('Just a string error')).toBe(
      'auth.errors.unknownError',
    );
    expect(mapServerError(null)).toBe('auth.errors.unknownError');
    expect(mapServerError(123)).toBe('auth.errors.unknownError');
  });

  it('returns default unknown error key if message does not match any known error code', () => {
    const error = new Error('Some random unmapped server error message');
    const result = mapServerError(error);
    expect(result).toBe('auth.errors.unknownError');
  });
});
