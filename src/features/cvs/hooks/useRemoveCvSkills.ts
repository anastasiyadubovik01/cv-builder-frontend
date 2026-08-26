import { DELETE_CV_SKILL_MUTATION } from '@/api/cv-skills';
import { useDeleteEntity } from '../../../components/hooks/useDeleteEntity';

type UseRemoveCvSkillsProps = {
  cvId: string;
  onSuccess?: () => void | Promise<void>;
};

export function useRemoveCvSkills({ cvId, onSuccess }: UseRemoveCvSkillsProps) {
  const { handleDelete, loading, t } = useDeleteEntity<
    unknown,
    { skill: { cvId: string; name: string[] } },
    [skillNames: string[]]
  >({
    mutation: DELETE_CV_SKILL_MUTATION,
    successMessageKey: 'skills.notifications.removeSuccess',
    defaultSuccessMessage: 'Skills removed successfully',
    errorContext: 'Remove CV skills',
    buildVariables: (skillNames) => ({ skill: { cvId, name: skillNames } }),
    onSuccess,
  });

  const handleRemove = (skillNames: string[]) => {
    if (skillNames.length === 0) return Promise.resolve(false);
    return handleDelete(skillNames);
  };

  return { handleRemove, loading, t };
}
