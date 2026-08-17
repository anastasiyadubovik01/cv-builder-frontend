import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { UPDATE_CV_MUTATION } from '@/api/cvs';
import { createCvSchema, type CreateCvFormValues } from '@/lib/validations/cv';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type UseUpdateCvFormOptions = {
  cvId: string;
  initialValues: CreateCvFormValues;
  onSuccess?: () => void;
};

export function useUpdateCvForm({
  cvId,
  initialValues,
  onSuccess,
}: UseUpdateCvFormOptions) {
  const { t } = useTranslation();

  const {
    formData,
    errors,
    validateForm,
    handleChange,
    setFormData,
    clearErrors,
  } = useValidatedForm<CreateCvFormValues>({
    initialValues,
    schema: createCvSchema,
  });

  const [updateCv, { loading }] = useMutation(UPDATE_CV_MUTATION);

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      await updateCv({
        variables: {
          cv: {
            cvId,
            name: formData.name.trim(),
            education: formData.education.trim(),
            description: formData.description.trim(),
          },
        },
      });

      clearErrors();

      toast.success(
        t('cvs.notifications.updateSuccess', 'CV was successfully updated!'),
      );

      onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Update CV',
      });
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
    validateForm,
    handleChange,
    handleSubmit,
    resetForm,
    t,
  };
}
