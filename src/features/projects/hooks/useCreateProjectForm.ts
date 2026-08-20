import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { handleFormError } from '@/lib/error/errorHandler';
import { CREATE_PROJECT_MUTATION } from '@/api/projects';
import {
  CreateProjectInputValues,
  createProjectSchema,
} from '@/lib/validations/project';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';

const INITIAL_VALUES: CreateProjectInputValues = {
  name: '',
  domain: '',
  startDate: '',
  endDate: '',
  description: '',
  environment: '',
};

type UseCreateProjectFormOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useCreateProjectForm({
  onSuccess,
}: UseCreateProjectFormOptions = {}) {
  const { t } = useTranslation();

  const {
    formData,
    errors,
    validateForm,
    handleChange,
    setFormData,
    clearErrors,
  } = useValidatedForm<CreateProjectInputValues>({
    initialValues: INITIAL_VALUES,
    schema: createProjectSchema,
  });

  const [createProject, { loading }] = useMutation(CREATE_PROJECT_MUTATION);

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    const environmentArray = formData.environment
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await createProject({
        variables: {
          project: {
            name: formData.name.trim(),
            domain: formData.domain.trim(),
            start_date: formData.startDate.trim(),
            end_date: formData.endDate.trim() || null,
            description: formData.description.trim(),
            environment: environmentArray,
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      toast.success(
        t(
          'projects.notifications.createSuccess',
          'Project has been successfully created',
        ),
      );

      await onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Create Project',
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
    validateForm,
    handleChange,
    handleSubmit,
    resetForm,
    t,
  };
}
