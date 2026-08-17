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

  const validateForm = (): boolean => {
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

  const handleChange =
    (field: keyof T) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    handleChange,
    clearErrors,
  };
}
