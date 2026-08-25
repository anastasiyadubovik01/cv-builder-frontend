import React, { useState } from 'react';
import type { ZodType } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  schema: ZodType<T>;
}

export function useValidatedForm<T extends Record<string, string>>({
  initialValues,
  schema,
}: UseFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  // Переносим отслеживание отправки внутрь валидатора
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const validateForm = (): boolean => {
    setIsSubmitted(true); // Форма была отправлена — включаем 'живую' валидацию
    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof T, string>> = {};

      for (const issue of result.error.issues) {
        const path = issue.path[0];

        if (
          typeof path === 'string' &&
          path in initialValues &&
          !fieldErrors[path as keyof T]
        ) {
          fieldErrors[path as keyof T] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const setFieldValue = (
    field: keyof T,
    value: string,
    options?: { shouldValidate?: boolean },
  ) => {
    setFormData((prev) => {
      const nextState: T = { ...prev, [field]: value };
      const validate = options?.shouldValidate ?? isSubmitted;

      if (validate) {
        validateField(field, nextState);
      }

      return nextState;
    });
  };

  const validateField = (field: keyof T, updatedData?: T): boolean => {
    const dataToValidate = updatedData || formData;
    const result = schema.safeParse(dataToValidate);

    if (result.success) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
      return true;
    }

    const issue = result.error.issues.find(
      (item) => String(item.path[0]) === String(field),
    );

    setErrors((prev) => ({
      ...prev,
      [field]: issue?.message,
    }));

    return !issue;
  };

  const handleChange =
    (field: keyof T) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFieldValue(field, event.target.value);
    };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitted,
    setIsSubmitted,
    validateForm,
    validateField,
    setFieldValue,
    handleChange,
    clearErrors,
  };
}
