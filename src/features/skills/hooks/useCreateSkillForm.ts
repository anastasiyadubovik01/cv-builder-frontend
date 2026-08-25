import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { CREATE_SKILL_MUTATION, type ApiSkill } from '@/api/skills';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminSkillSchema,
  type AdminSkillFormValues,
} from '@/lib/validations/admin-skill';

const INITIAL_VALUES: AdminSkillFormValues = {
  name: '',
  categoryId: '',
};

type UseCreateSkillFormOptions = {
  skills: ApiSkill[];
  onSuccess?: () => void | Promise<void>;
};

export function useCreateSkillForm({
  skills,
  onSuccess,
}: UseCreateSkillFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<AdminSkillFormValues>({
      initialValues: INITIAL_VALUES,
      schema: adminSkillSchema,
    });

  const [createSkill, { loading }] = useMutation(CREATE_SKILL_MUTATION);

  const normalizedName = formData.name.trim().toLowerCase();

  const isDuplicate =
    normalizedName !== '' &&
    skills.some((skill) => skill.name.trim().toLowerCase() === normalizedName);

  const isValid = adminSkillSchema.safeParse(formData).success && !isDuplicate;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || isDuplicate) {
      return false;
    }

    try {
      await createSkill({
        variables: {
          skill: {
            name: formData.name.trim(),
            categoryId: formData.categoryId,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('skills.admin.notifications.createSuccess'));

      setFieldValue('name', '');
      setFieldValue('categoryId', '');

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Create skill',
      });

      return false;
    }
  };

  return {
    formData,
    errors,
    loading,
    isValid,
    isDuplicate,
    setFieldValue,
    validateField,
    handleSubmit,
    t,
  };
}
