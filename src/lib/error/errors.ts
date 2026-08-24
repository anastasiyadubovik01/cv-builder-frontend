// Server
export const SERVER_ERROR_CODES = {
  USER_ALREADY_EXISTS: 'userAlreadyExists',
  FAILED_TO_SEND_EMAIL: 'failedToSendEmail',
  INVALID_CREDENTIALS: 'invalidCredentials',
  UNAUTHORIZED: 'unauthorized',
  EXPIRED_RESET_TOKEN: 'actionExpired',
  INVALID_OTP: 'mailNotFound',
  PROJECT_HAS_BEEN_ADDED: 'projectHasBeenAdded',
  POSITION_IS_IN_USE: 'positionIsUsed',

  // Пока не протестированы конкретные имена ошибок
  EXPIRED_OTP: 'expiredOtp',
} as const;

// Client
export const CLIENT_ERROR_CODES = {
  AUTH_REFRESH_FAILED: 'authRefreshFailed',
} as const;

// Types
export type ServerErrorCode =
  (typeof SERVER_ERROR_CODES)[keyof typeof SERVER_ERROR_CODES];

export type ClientErrorCode =
  (typeof CLIENT_ERROR_CODES)[keyof typeof CLIENT_ERROR_CODES];

// Errors
export class AuthRefreshError extends Error {
  constructor() {
    super('Unable to refresh authentication tokens');
    this.name = 'AuthRefreshError';
  }
}
