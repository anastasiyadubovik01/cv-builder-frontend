import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_SKILL_MUTATION } from '@/api/skills';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

export function useDeleteSkill() {
  const { t } = useTranslation();

  const [deleteSkill] = useMutation(DELETE_SKILL_MUTATION);

  const handleDelete = async (skillId: string): Promise<boolean> => {
    try {
      await deleteSkill({
        variables: {
          skill: {
            skillId,
          },
        },
      });

      toast.success(t('skills.admin.notifications.deleteSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Delete skill',
      });

      return false;
    }
  };

  return {
    handleDelete,
    t,
  };
}
