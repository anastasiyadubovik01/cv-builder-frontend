import type { TFunction } from 'i18next';
import { toast } from '@/components/ui/sonner';
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
    toast.error(t(translationKey));
  }

  if (context) {
    console.error(`${context}:`, error);
  }
}
