import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { handleFormError } from '@/lib/error/errorHandler';
import { UPDATE_PROJECT_MUTATION } from '@/api/projects';
import {
  CreateProjectInputValues,
  createProjectSchema,
} from '@/lib/validations/project';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import type { Project } from '../types';

type UseUpdateProjectFormOptions = {
  project: Project;
  onSuccess?: () => void | Promise<void>;
};

const getProjectInitialValues = (
  proj: Project,
  presentText: string,
): CreateProjectInputValues => {
  const isPresent = proj.endDate === 'Present' || proj.endDate === presentText;

  return {
    name: proj.name || '',
    domain: proj.domain || '',
    startDate: proj.startDate || '',
    endDate: isPresent ? '' : proj.endDate || '',
    description: proj.description || '',
    environment: Array.isArray(proj.environmentSkills)
      ? proj.environmentSkills.join(', ')
      : '',
  };
};

export function useUpdateProjectForm({
  project,
  onSuccess,
}: UseUpdateProjectFormOptions) {
  const { t } = useTranslation();

  const initialValues = getProjectInitialValues(
    project,
    t('projects.present', 'Present'),
  );

  const {
    formData,
    errors,
    validateForm,
    handleChange,
    setFieldValue,
    setFormData,
    clearErrors,
  } = useValidatedForm<CreateProjectInputValues>({
    initialValues,
    schema: createProjectSchema,
  });

  const [updateProject, { loading }] = useMutation(UPDATE_PROJECT_MUTATION);

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    const environmentArray = formData.environment
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await updateProject({
        variables: {
          project: {
            projectId: project.id,
            name: formData.name.trim(),
            domain: formData.domain.trim(),
            start_date: formData.startDate.trim(),
            end_date: formData.endDate.trim() || null,
            description: formData.description.trim(),
            environment: environmentArray,
          },
        },
      });

      clearErrors();

      toast.success(
        t(
          'projects.notifications.updateSuccess',
          'Project has been successfully updated',
        ),
      );

      await onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Update Project',
      });
      return false;
    }
  };

  const resetForm = () => {
    setFormData(
      getProjectInitialValues(project, t('projects.present', 'Present')),
    );
    clearErrors();
  };

  return {
    formData,
    errors,
    loading,
    validateForm,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetForm,
    t,
  };
}
