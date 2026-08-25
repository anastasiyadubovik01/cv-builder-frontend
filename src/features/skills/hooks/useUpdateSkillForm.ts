import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { UPDATE_SKILL_MUTATION, type ApiSkill } from '@/api/skills';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminSkillSchema,
  type AdminSkillFormValues,
} from '@/lib/validations/admin-skill';

type UseUpdateSkillFormOptions = {
  skill: ApiSkill;
  skills: ApiSkill[];
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateSkillForm({
  skill,
  skills,
  onSuccess,
}: UseUpdateSkillFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<AdminSkillFormValues>({
      initialValues: {
        name: skill.name,
        categoryId: skill.category.id,
      },
      schema: adminSkillSchema,
    });

  const [updateSkill, { loading }] = useMutation(UPDATE_SKILL_MUTATION);

  const normalizedName = formData.name.trim().toLowerCase();

  const isDuplicate =
    normalizedName !== '' &&
    skills.some(
      (item) =>
        item.id !== skill.id &&
        item.name.trim().toLowerCase() === normalizedName,
    );

  const isValid = adminSkillSchema.safeParse(formData).success && !isDuplicate;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || isDuplicate) {
      return false;
    }

    try {
      await updateSkill({
        variables: {
          skill: {
            skillId: skill.id,
            name: formData.name.trim(),
            categoryId: formData.categoryId,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('skills.admin.notifications.updateSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update skill',
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
