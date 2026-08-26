import { DELETE_PROFILE_SKILL_MUTATION } from '@/api/skills';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type UseRemoveUserSkillsOptions = {
  userId: string;
  onSuccess?: () => void | Promise<void>;
};

type RemoveUserSkillsVars = {
  skill: { userId: string; name: string[] };
};

export function useRemoveUserSkills({
  userId,
  onSuccess,
}: UseRemoveUserSkillsOptions) {
  const { handleDelete, loading, t } = useDeleteEntity<
    unknown,
    RemoveUserSkillsVars,
    [names: string[]]
  >({
    mutation: DELETE_PROFILE_SKILL_MUTATION,
    successMessageKey: 'skills.removeSuccess',
    errorContext: 'Remove user skills',
    buildVariables: (names) => ({ skill: { userId, name: names } }),
    onSuccess,
  });

  const handleRemove = (names: string[]) => {
    if (names.length === 0) return Promise.resolve(false);
    return handleDelete(names);
  };

  return { handleRemove, loading, t };
}
