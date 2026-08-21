import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { DELETE_CV_SKILL_MUTATION } from '@/api/cv-skills';
import { handleFormError } from '@/lib/error/errorHandler';
import { toast } from '@/components/ui/sonner';

type UseRemoveCvSkillsProps = {
  cvId: string;
  onSuccess?: () => void | Promise<void>;
};

export function useRemoveCvSkills({ cvId, onSuccess }: UseRemoveCvSkillsProps) {
  const { t } = useTranslation();
  const [deleteCvSkill, { loading }] = useMutation(DELETE_CV_SKILL_MUTATION);

  const handleRemove = async (skillNames: string[]): Promise<boolean> => {
    if (skillNames.length === 0) {
      return false;
    }

    try {
      await deleteCvSkill({
        variables: {
          skill: {
            cvId,
            name: skillNames,
          },
        },
      });

      toast.success(
        t('skills.notifications.removeSuccess', 'Skills removed successfully'),
      );
      await onSuccess?.();
      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Remove CV skills',
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
