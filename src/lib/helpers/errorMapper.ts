import {
  SERVER_ERROR_CODES,
  type ServerErrorCode,
} from '@/lib/constants/errors';

type ErrorMapping = {
  [K in ServerErrorCode]?: string;
};

export const DEFAULT_ERROR_MAPPING: ErrorMapping = {
  [SERVER_ERROR_CODES.USER_ALREADY_EXISTS]: 'auth.errors.userAlreadyExists',
  [SERVER_ERROR_CODES.FAILED_TO_SEND_EMAIL]: 'auth.errors.failedToSendEmail',
  [SERVER_ERROR_CODES.INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
  [SERVER_ERROR_CODES.UNAUTHORIZED]: 'auth.errors.unauthorized',
  [SERVER_ERROR_CODES.EXPIRED_RESET_TOKEN]: 'auth.errors.expiredResetToken',

  // Пока не протестированы конкретные имена ошибок
  [SERVER_ERROR_CODES.INVALID_OTP]: 'auth.errors.invalidOtp',
  [SERVER_ERROR_CODES.EXPIRED_OTP]: 'auth.errors.expiredOtp',
  [SERVER_ERROR_CODES.USER_NOT_FOUND]: 'auth.errors.userNotFound',
};

export function mapServerError(
  error: unknown,
  customMapping: ErrorMapping = {},
): string {
  if (!(error instanceof Error)) {
    return 'auth.errors.unknownError';
  }

  const message = error.message.toLowerCase();
  const mapping = { ...DEFAULT_ERROR_MAPPING, ...customMapping };

  for (const [key, translationKey] of Object.entries(mapping)) {
    if (message.includes(key.toLowerCase())) {
      return translationKey;
    }
  }

  return 'auth.errors.unknownError';
}
