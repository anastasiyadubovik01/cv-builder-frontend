export const SERVER_ERROR_CODES = {
  USER_ALREADY_EXISTS: 'userAlreadyExists',
  FAILED_TO_SEND_EMAIL: 'failedToSendEmail',
  INVALID_CREDENTIALS: 'invalidCredentials',
  UNAUTHORIZED: 'unauthorized',
  EXPIRED_RESET_TOKEN: 'actionExpired',

  // Пока не протестированы конкретные имена ошибок
  INVALID_OTP: 'invalidOtp',
  EXPIRED_OTP: 'expiredOtp',
} as const;

export type ServerErrorCode =
  (typeof SERVER_ERROR_CODES)[keyof typeof SERVER_ERROR_CODES];
