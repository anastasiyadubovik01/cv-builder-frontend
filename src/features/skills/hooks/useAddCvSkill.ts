import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { ADD_CV_SKILL_MUTATION } from '@/api/cv-skills';
import type { ApiSkill } from '@/api/skills';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import type { Mastery } from '@/features/skills/types';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  addSkillSchema,
  type AddSkillFormValues,
} from '@/lib/validations/skill';

const INITIAL_VALUES: AddSkillFormValues = {
  skillName: '',
  mastery: '',
};

type UseAddCvSkillOptions = {
  cvId: string;
  skills: ApiSkill[];
  onSuccess?: () => void | Promise<void>;
};

export function useAddCvSkill({
  cvId,
  skills,
  onSuccess,
}: UseAddCvSkillOptions) {
  const { t } = useTranslation();

  const {
    formData,
    setFormData,
    errors,
    validateForm,
    validateField,
    setFieldValue,
    clearErrors,
  } = useValidatedForm<AddSkillFormValues>({
    initialValues: INITIAL_VALUES,
    schema: addSkillSchema,
  });

  const [addCvSkill, { loading }] = useMutation(ADD_CV_SKILL_MUTATION);

  const isValid = addSkillSchema.safeParse(formData).success;

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
      await addCvSkill({
        variables: {
          skill: {
            cvId,
            name: selectedSkill.name,
            categoryId: selectedSkill.category.id,
            mastery: formData.mastery as Mastery,
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      await onSuccess?.();

      toast.success(t('skills.addSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Add CV skill',
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
