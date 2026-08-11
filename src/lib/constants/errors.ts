export const SERVER_ERROR_CODES = {
  USER_ALREADY_EXISTS: 'userAlreadyExists',
  FAILED_TO_SEND_EMAIL: 'failedToSendEmail',
} as const;

export type ServerErrorCode =
  (typeof SERVER_ERROR_CODES)[keyof typeof SERVER_ERROR_CODES];
