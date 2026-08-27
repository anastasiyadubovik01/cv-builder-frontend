import { DELETE_SKILL_MUTATION } from '@/api/skills';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type DeleteSkillVars = {
  skill: { skillId: string };
};

export function useDeleteSkill() {
  const { handleDelete, loading } = useDeleteEntity<
    unknown,
    DeleteSkillVars,
    [skillId: string]
  >({
    mutation: DELETE_SKILL_MUTATION,
    successMessageKey: 'skills.admin.notifications.deleteSuccess',
    errorContext: 'Delete skill',
    buildVariables: (skillId) => ({ skill: { skillId } }),
  });

  return { handleDelete, loading };
}
