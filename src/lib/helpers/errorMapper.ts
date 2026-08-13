import {
  AuthRefreshError,
  SERVER_ERROR_CODES,
  CLIENT_ERROR_CODES,
  type ServerErrorCode,
  type ClientErrorCode,
} from '@/lib/constants/errors';

type ErrorMapping = Partial<Record<ServerErrorCode, string>>;

const CLIENT_ERROR_MAPPING: Record<ClientErrorCode, string> = {
  [CLIENT_ERROR_CODES.AUTH_REFRESH_FAILED]: 'auth.errors.authRefreshFailed',
};

export const DEFAULT_ERROR_MAPPING: ErrorMapping = {
  [SERVER_ERROR_CODES.USER_ALREADY_EXISTS]: 'auth.errors.userAlreadyExists',
  [SERVER_ERROR_CODES.FAILED_TO_SEND_EMAIL]: 'auth.errors.failedToSendEmail',
  [SERVER_ERROR_CODES.INVALID_CREDENTIALS]: 'auth.errors.invalidCredentials',
  [SERVER_ERROR_CODES.UNAUTHORIZED]: 'auth.errors.unauthorized',
  [SERVER_ERROR_CODES.EXPIRED_RESET_TOKEN]: 'auth.errors.expiredResetToken',
  [SERVER_ERROR_CODES.INVALID_OTP]: 'auth.errors.invalidOtp',

  // Пока не протестированы конкретные имена ошибок
  [SERVER_ERROR_CODES.EXPIRED_OTP]: 'auth.errors.expiredOtp',
};

export function mapServerError(
  error: unknown,
  customMapping: ErrorMapping = {},
): string {
  if (error instanceof AuthRefreshError) {
    return CLIENT_ERROR_MAPPING[CLIENT_ERROR_CODES.AUTH_REFRESH_FAILED];
  }

  if (!(error instanceof Error)) {
    return 'auth.errors.unknownError';
  }

  const message = error.message.toLowerCase();
  const mapping = { ...DEFAULT_ERROR_MAPPING, ...customMapping };

  for (const [code, translationKey] of Object.entries(mapping)) {
    if (translationKey && message.includes(code.toLowerCase())) {
      return translationKey;
    }
  }

  return 'auth.errors.unknownError';
}
