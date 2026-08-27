import { useTranslation } from 'react-i18next';
import { type DocumentNode } from '@apollo/client';
import { handleFormError } from '@/lib/error/errorHandler';
import { createCvSchema, type CreateCvFormValues } from '@/lib/validations/cv';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { useMutation } from '@apollo/client/react';

type UseCvFormOptions = {
  mutation: DocumentNode;
  initialValues: CreateCvFormValues;
  successMessageKey: string;
  defaultSuccessMessage: string;
  errorContext: string;
  buildVariables: (values: CreateCvFormValues) => Record<string, unknown>;
  onSuccess?: () => void | Promise<void>;
};

export function useCvForm({
  mutation,
  initialValues,
  successMessageKey,
  defaultSuccessMessage,
  errorContext,
  buildVariables,
  onSuccess,
}: UseCvFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const {
    formData,
    errors,
    validateForm,
    validateField,
    handleChange,
    setFormData,
    clearErrors,
  } = useValidatedForm<CreateCvFormValues>({
    initialValues,
    schema: createCvSchema,
  });

  const [mutate, { loading }] = useMutation(mutation);
  const isValid = createCvSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    try {
      await mutate({
        variables: buildVariables({
          name: formData.name.trim(),
          education: formData.education.trim(),
          description: formData.description.trim(),
        }),
      });

      clearErrors();
      toast.success(t(successMessageKey, defaultSuccessMessage));

      await onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, { t, context: errorContext });
      return false;
    }
  };

  const resetForm = () => {
    setFormData(initialValues);
    clearErrors();
  };

  return {
    formData,
    errors,
    loading,
    isValid,
    validateField,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    t,
  };
}
