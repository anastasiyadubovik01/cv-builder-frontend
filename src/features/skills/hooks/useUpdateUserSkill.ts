import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { UPDATE_PROFILE_SKILL_MUTATION } from '@/api/skills';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import type { Mastery } from '@/features/skills/types';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  addUserSkillSchema,
  type AddUserSkillFormValues,
} from '@/lib/validations/skill';

type UseUpdateUserSkillOptions = {
  userId: string;
  skillName: string;
  categoryId: string | null;
  mastery: Mastery;
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateUserSkill({
  userId,
  skillName,
  categoryId,
  mastery,
  onSuccess,
}: UseUpdateUserSkillOptions) {
  const { t } = useTranslation();

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<AddUserSkillFormValues>({
      initialValues: {
        skillName,
        mastery,
      },
      schema: addUserSkillSchema,
    });

  const [updateProfileSkill, { loading }] = useMutation(
    UPDATE_PROFILE_SKILL_MUTATION,
  );

  const isValid = addUserSkillSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      await updateProfileSkill({
        variables: {
          skill: {
            userId,
            name: skillName,
            categoryId: categoryId ?? undefined,
            mastery: formData.mastery as Mastery,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('users.skills.updateSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update user skill',
      });

      return false;
    }
  };

  return {
    formData,
    errors,
    loading,
    isValid,
    setFieldValue,
    validateField,
    handleSubmit,
    t,
  };
}
