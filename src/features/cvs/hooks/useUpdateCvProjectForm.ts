import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@apollo/client/react';

import { PROJECTS_QUERY, type ApiProject } from '@/api/projects';
import { POSITIONS_QUERY, type PositionsQueryResponse } from '@/api/positions';
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
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type UseUpdateCvProjectFormOptions = {
  cvId: string;
  project: ApiCvProject;
  onSuccess?: () => void | Promise<void>;
};

const LIMIT = 1000;

export function useUpdateCvProjectForm({
  cvId,
  project,
  onSuccess,
}: UseUpdateCvProjectFormOptions) {
  const { t } = useTranslation();

  const initialValues: UpdateCvProjectInputValues = useMemo(() => {
    const realProjectId = project.project?.id || '';

    const envString = Array.isArray(project.environment)
      ? project.environment.join(', ')
      : project.environment || project.project?.environment?.join(', ') || '';

    const rolesString = Array.isArray(project.roles)
      ? project.roles.join(', ')
      : '';

    const responsibilitiesString = Array.isArray(project.responsibilities)
      ? project.responsibilities.join('\n')
      : '';

    return {
      projectId: realProjectId,
      startDate: project.start_date || project.project?.start_date || '',
      endDate: project.end_date || project.project?.end_date || '',
      roles: rolesString,
      responsibilities: responsibilitiesString,
      domain: project.domain || project.project?.domain || '',
      description: project.description || project.project?.description || '',
      environment: envString,
      projectStartDate: project.project?.start_date || '',
      projectEndDate: project.project?.end_date || '',
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

  const { data: projectsData, loading: projectsLoading } = useQuery(
    PROJECTS_QUERY,
    {
      variables: { params: { limit: LIMIT } },
    },
  );

  const { data: positionsData, loading: positionsLoading } =
    useQuery<PositionsQueryResponse>(POSITIONS_QUERY, {
      variables: { params: { limit: LIMIT } },
    });

  const [updateCvProject, { loading: mutationLoading }] = useMutation<
    UpdateCvProjectData,
    UpdateCvProjectVars
  >(UPDATE_CV_PROJECT_MUTATION);

  const catalogProjects: ApiProject[] = projectsData?.projects?.items || [];
  const positions = positionsData?.positions?.items || [];

  const isDirty = useMemo(() => {
    return (
      formData.startDate !== initialValues.startDate ||
      formData.endDate !== initialValues.endDate ||
      formData.roles !== initialValues.roles ||
      formData.responsibilities !== initialValues.responsibilities
    );
  }, [formData, initialValues]);

  const handleProjectSelect = () => {
    // В режиме Update выбор проекта заблокирован
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!isDirty) {
      return false;
    }

    if (!validateForm()) {
      return false;
    }

    const rolesArray = formData.roles
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const responsibilitiesArray = formData.responsibilities
      ? formData.responsibilities
          .split(/[\n,]+/)
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    try {
      await updateCvProject({
        variables: {
          project: {
            cvId,
            projectId: formData.projectId,
            start_date: formData.startDate.trim(),
            end_date: formData.endDate.trim() || null,
            roles: rolesArray,
            responsibilities: responsibilitiesArray,
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
      handleFormError(err, {
        t,
        context: 'Update CV Project',
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
    loading: mutationLoading || projectsLoading || positionsLoading,
    isValid: isDirty,
    catalogProjects,
    positions,
    handleChange,
    setFieldValue,
    validateField,
    handleProjectSelect,
    handleSubmit,
    resetForm,
    t,
  };
}
