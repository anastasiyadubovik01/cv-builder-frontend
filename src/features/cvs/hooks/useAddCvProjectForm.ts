import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@apollo/client/react';

import { PROJECTS_QUERY, type ApiProject } from '@/api/projects';
import { POSITIONS_QUERY, type PositionsQueryResponse } from '@/api/positions';
import { ADD_CV_PROJECT_MUTATION } from '@/api/cv-projects';
import {
  type CreateCvProjectInputValues,
  createCvProjectSchema,
} from '@/lib/validations/cv-project';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

const INITIAL_VALUES: CreateCvProjectInputValues = {
  projectId: '',
  startDate: '',
  endDate: '',
  roles: '',
  responsibilities: '',
  domain: '',
  description: '',
  environment: '',
  projectStartDate: '',
  projectEndDate: '',
};

type UseCreateCvProjectFormOptions = {
  cvId: string;
  onSuccess?: () => void | Promise<void>;
};

const LIMIT = 1000;

export function useAddCvProjectForm({
  cvId,
  onSuccess,
}: UseCreateCvProjectFormOptions) {
  const { t } = useTranslation();

  const {
    formData,
    errors,
    validateForm,
    validateField,
    handleChange,
    setFieldValue,
    setFormData,
    clearErrors,
  } = useValidatedForm<CreateCvProjectInputValues>({
    initialValues: INITIAL_VALUES,
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

  const [addCvProject, { loading: mutationLoading }] = useMutation(
    ADD_CV_PROJECT_MUTATION,
  );

  const catalogProjects: ApiProject[] = projectsData?.projects?.items || [];
  const positions = positionsData?.positions?.items || [];

  const isValid = createCvProjectSchema.safeParse(formData).success;

  const handleProjectSelect = (selectedProjectId: string) => {
    const project = catalogProjects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    const envString = Array.isArray(project.environment)
      ? project.environment.join(', ')
      : project.environment || '';

    setFormData((prev) => ({
      ...prev,
      projectId: project.id,
      domain: project.domain || '',
      description: project.description || '',
      environment: envString,
      startDate: project.start_date || '',
      endDate: project.end_date || '',
      projectStartDate: project.start_date || '',
      projectEndDate: project.end_date || '',
    }));
    clearErrors();
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    const rolesArray = formData.roles
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const responsibilitiesArray = formData.responsibilities
      ? formData.responsibilities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    try {
      await addCvProject({
        variables: {
          project: {
            cvId,
            projectId: formData.projectId,
            start_date: formData.startDate.trim(),
            end_date: formData.endDate?.trim() || null,
            roles: rolesArray,
            responsibilities: responsibilitiesArray,
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      toast.success(
        t(
          'projects.notifications.addCvProjectSuccess',
          'Project has been successfully added to CV',
        ),
      );

      await onSuccess?.();
      return true;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Add CV Project',
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
    loading: mutationLoading || projectsLoading || positionsLoading,
    isValid,
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
