import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';

import { ADD_CV_PROJECT_MUTATION } from '@/api/cv-projects';
import {
  type CreateCvProjectInputValues,
  createCvProjectSchema,
} from '@/lib/validations/cv-project';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import { useCvProjectForm } from './useCvProjectForm';
import { parseCommaSeparated } from '@/lib/helpers/formatters';

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

type UseAddCvProjectFormOptions = {
  cvId: string;
  onSuccess?: () => void | Promise<void>;
};

export function useAddCvProjectForm({
  cvId,
  onSuccess,
}: UseAddCvProjectFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    catalogProjects,
    positions,
    loadingCatalog,
    getAutoFilledProjectData,
  } = useCvProjectForm();

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

  const [addCvProject, { loading: mutationLoading }] = useMutation(
    ADD_CV_PROJECT_MUTATION,
  );

  const isValid = createCvProjectSchema.safeParse(formData).success;

  const handleProjectSelect = (selectedProjectId: string) => {
    const autofillData = getAutoFilledProjectData(selectedProjectId);
    if (!autofillData) return;

    setFormData((prev) => ({
      ...prev,
      ...autofillData,
    }));
    clearErrors();
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) return false;

    try {
      await addCvProject({
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
      handleFormError(err, { t, context: 'Add CV Project' });
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
    loading: mutationLoading || loadingCatalog,
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
