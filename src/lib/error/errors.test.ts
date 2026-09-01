import { describe, it, expect } from 'vitest';
import {
  SERVER_ERROR_CODES,
  CLIENT_ERROR_CODES,
  AuthRefreshError,
} from './errors';

describe('errors', () => {
  it('should define correct server error codes mapping', () => {
    expect(SERVER_ERROR_CODES).toEqual({
      USER_ALREADY_EXISTS: 'userAlreadyExists',
      FAILED_TO_SEND_EMAIL: 'failedToSendEmail',
      INVALID_CREDENTIALS: 'invalidCredentials',
      UNAUTHORIZED: 'unauthorized',
      EXPIRED_RESET_TOKEN: 'actionExpired',
      INVALID_OTP: 'mailNotFound',
      PROJECT_HAS_BEEN_ADDED: 'projectHasBeenAdded',
      DEPARTMENT_IS_IN_USE: 'cannotDeleteDepartmentInUse',
      POSITION_IS_IN_USE: 'cannotDeletePositionInUse',
      OLD_PASSWORD_INCORRECT: 'oldPasswordIncorrect',
      OLD_PASSWORD_SAME_NEW_PASSWORD: 'oldPasswordSameNewPassword',
      CONFIRM_PASSWORD_MISMATCH: 'confirmPasswordMismatch',
      EXPIRED_OTP: 'expiredOtp',
    });
  });

  it('should define correct client error codes mapping', () => {
    expect(CLIENT_ERROR_CODES).toEqual({
      AUTH_REFRESH_FAILED: 'authRefreshFailed',
    });
  });

  it('should correctly instantiate AuthRefreshError with default name and message', () => {
    const error = new AuthRefreshError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthRefreshError);
    expect(error.name).toBe('AuthRefreshError');
    expect(error.message).toBe('Unable to refresh authentication tokens');
  });
});
