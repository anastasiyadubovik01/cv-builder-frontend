import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { UPDATE_CV_SKILL_MUTATION } from '@/api/cv-skills';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import type { Mastery } from '@/features/skills/types';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  addSkillSchema,
  type AddSkillFormValues,
} from '@/lib/validations/skill';

type UseUpdateCvSkillOptions = {
  cvId: string;
  skillName: string;
  categoryId: string | null;
  mastery: Mastery;
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateCvSkill({
  cvId,
  skillName,
  categoryId,
  mastery,
  onSuccess,
}: UseUpdateCvSkillOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<AddSkillFormValues>({
      initialValues: {
        skillName,
        mastery,
      },
      schema: addSkillSchema,
    });

  const [updateCvSkill, { loading }] = useMutation(UPDATE_CV_SKILL_MUTATION);

  const isValid = addSkillSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      await updateCvSkill({
        variables: {
          skill: {
            cvId,
            name: skillName,
            categoryId: categoryId ?? undefined,
            mastery: formData.mastery as Mastery,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('skills.updateSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update CV skill',
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
