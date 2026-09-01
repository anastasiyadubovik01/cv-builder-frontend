import type { TFunction } from 'i18next';
import { toast as sonnerToast } from 'sonner';
import { mapServerError } from '@/lib/error/errorMapper';

interface HandleFormErrorOptions {
  t: TFunction;
  fieldErrorKeys?: readonly string[];
  setFieldError?: (error: string) => void;
  context?: string;
}

export function handleFormError(
  error: unknown,
  { t, fieldErrorKeys = [], setFieldError, context }: HandleFormErrorOptions,
): void {
  const translationKey = mapServerError(error);

  if (fieldErrorKeys.includes(translationKey) && setFieldError) {
    setFieldError(translationKey);
  } else {
    sonnerToast.error(t('toast.error'), {
      description: t(translationKey),
    });
  }

  if (context && process.env.NODE_ENV === 'development') {
    console.error(`${context}:`, error);
  }
}
