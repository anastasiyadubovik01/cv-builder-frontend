import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_PROFILE_SKILL_MUTATION } from '@/api/skills';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type UseRemoveUserSkillsOptions = {
  userId: string;
  onSuccess?: () => void | Promise<void>;
};

export function useRemoveUserSkills({
  userId,
  onSuccess,
}: UseRemoveUserSkillsOptions) {
  const { t } = useTranslation();

  const [deleteProfileSkill, { loading }] = useMutation(
    DELETE_PROFILE_SKILL_MUTATION,
  );

  const handleRemove = async (names: string[]): Promise<boolean> => {
    if (names.length === 0) {
      return false;
    }

    try {
      await deleteProfileSkill({
        variables: {
          skill: {
            userId,
            name: names,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('users.skills.removeSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Remove user skills',
      });

      return false;
    }
  };

  return {
    handleRemove,
    loading,
    t,
  };
}
