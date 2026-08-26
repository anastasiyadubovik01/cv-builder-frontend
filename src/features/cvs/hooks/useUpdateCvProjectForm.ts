import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import {
  UPDATE_CV_PROJECT_MUTATION,
  type ApiCvProject,
  type UpdateCvProjectData,
  type UpdateCvProjectVars,
} from '@/api/cv-projects';
import {
  type UpdateCvProjectInputValues,
  createCvProjectSchema,
} from '@/lib/validations/cv-project';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { useCvProjectForm } from './useCvProjectForm';
import {
  formatArrayToCommaSeparated,
  parseCommaSeparated,
} from '@/lib/helpers/formatters';

type UseUpdateCvProjectFormOptions = {
  cvId: string;
  project: ApiCvProject;
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateCvProjectForm({
  cvId,
  project,
  onSuccess,
}: UseUpdateCvProjectFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();
  const { catalogProjects, positions, loadingCatalog } = useCvProjectForm();

  const initialValues: UpdateCvProjectInputValues = useMemo(() => {
    const realProjectId = project.project?.id || '';
    const envString = formatArrayToCommaSeparated(
      project.environment || project.project?.environment,
    );

    return {
      projectId: realProjectId,
      startDate: project.start_date || project.project?.start_date || '',
      endDate: project.end_date || project.project?.end_date || '',
      roles: formatArrayToCommaSeparated(project.roles),
      responsibilities: formatArrayToCommaSeparated(project.responsibilities),
      domain: project.domain || project.project?.domain || '',
      description: project.description || project.project?.description || '',
      environment: envString,
      projectStartDate: project.project?.start_date || project.start_date || '',
      projectEndDate: project.project?.end_date || project.end_date || '',
    };
  }, [project]);

  const {
    formData,
    errors,
    validateForm,
    validateField,
    handleChange,
    setFieldValue,
    setFormData,
    clearErrors,
  } = useValidatedForm<UpdateCvProjectInputValues>({
    initialValues,
    schema: createCvProjectSchema,
  });

  const [updateCvProject, { loading: mutationLoading }] = useMutation<
    UpdateCvProjectData,
    UpdateCvProjectVars
  >(UPDATE_CV_PROJECT_MUTATION);

  const isDirty = useMemo(() => {
    return (
      formData.startDate.trim() !== initialValues.startDate.trim() ||
      formData.endDate?.trim() !== initialValues.endDate?.trim() ||
      formData.roles.trim() !== initialValues.roles.trim() ||
      (formData.responsibilities || '').trim() !==
        (initialValues.responsibilities || '').trim()
    );
  }, [formData, initialValues]);

  const isSchemaValid = createCvProjectSchema.safeParse(formData).success;
  const isValid = isDirty && isSchemaValid;

  const handleSubmit = async (): Promise<boolean> => {
    if (!isValid || !validateForm()) return false;

    try {
      await updateCvProject({
        variables: {
          project: {
            cvId,
            projectId: formData.projectId,
            start_date: formData.startDate.trim(),
            end_date: formData.endDate?.trim() || null,
            roles: parseCommaSeparated(formData.roles),
            responsibilities: parseCommaSeparated(formData.responsibilities),
          },
        },
      });

      clearErrors();

      toast.success(
        t(
          'projects.notifications.updateCvProjectSuccess',
          'CV Project was successfully updated',
        ),
      );

      await onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, { t, context: 'Update CV Project' });
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
    loading: mutationLoading || loadingCatalog,
    isValid,
    catalogProjects,
    positions,
    handleChange,
    setFieldValue,
    validateField,
    handleSubmit,
    resetForm,
    t,
  };
}
