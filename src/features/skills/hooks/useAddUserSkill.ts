import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { ADD_PROFILE_SKILL_MUTATION, type ApiSkill } from '@/api/skills';
import type { Mastery } from '@/features/skills/types';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  addUserSkillSchema,
  type AddUserSkillFormValues,
} from '@/lib/validations/skill';

const INITIAL_VALUES: AddUserSkillFormValues = {
  skillName: '',
  mastery: '',
};

type UseAddUserSkillOptions = {
  userId: string;
  skills: ApiSkill[];
  onSuccess?: () => void | Promise<void>;
};

export function useAddUserSkill({
  userId,
  skills,
  onSuccess,
}: UseAddUserSkillOptions) {
  const { t } = useTranslation();

  const {
    formData,
    setFormData,
    errors,
    validateForm,
    validateField,
    setFieldValue,
    clearErrors,
  } = useValidatedForm<AddUserSkillFormValues>({
    initialValues: INITIAL_VALUES,
    schema: addUserSkillSchema,
  });

  const [addProfileSkill, { loading }] = useMutation(
    ADD_PROFILE_SKILL_MUTATION,
  );

  const isValid = addUserSkillSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    const selectedSkill = skills.find(
      (skill) => skill.name === formData.skillName,
    );

    if (!selectedSkill) {
      return false;
    }

    try {
      await addProfileSkill({
        variables: {
          skill: {
            userId,
            name: selectedSkill.name,
            categoryId: selectedSkill.category.id,
            mastery: formData.mastery as Mastery,
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      await onSuccess?.();

      toast.success(t('users.skills.addSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Add user skill',
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
