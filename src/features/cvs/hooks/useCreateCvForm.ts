import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { handleFormError } from '@/lib/error/errorHandler';
import { CREATE_CV_MUTATION } from '@/api/cvs';
import { type CreateCvFormValues, createCvSchema } from '@/lib/validations/cv';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';

const INITIAL_VALUES: CreateCvFormValues = {
  name: '',
  education: '',
  description: '',
};

type UseCreateCvFormOptions = {
  userId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useCreateCvForm({
  userId,
  onSuccess,
}: UseCreateCvFormOptions = {}) {
  const { t } = useTranslation();

  const {
    formData,
    errors,
    validateForm,
    validateField,
    handleChange,
    setFormData,
    clearErrors,
  } = useValidatedForm<CreateCvFormValues>({
    initialValues: INITIAL_VALUES,
    schema: createCvSchema,
  });

  const [createCv, { loading }] = useMutation(CREATE_CV_MUTATION);
  const isValid = createCvSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      await createCv({
        variables: {
          cv: {
            name: formData.name.trim(),
            education: formData.education.trim(),
            description: formData.description.trim(),
            userId: userId || undefined,
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      toast.success(
        t(
          'cvs.notifications.createSuccess',
          'CV has been successfully created',
        ),
      );

      await onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Create CV',
      });
      return false;
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_VALUES);
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
    t,
  };
}
