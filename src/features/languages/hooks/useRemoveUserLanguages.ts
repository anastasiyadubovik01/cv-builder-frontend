import { DELETE_PROFILE_LANGUAGE_MUTATION } from '@/api/languages';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type UseRemoveUserLanguagesOptions = {
  userId: string;
  onSuccess?: () => void | Promise<void>;
};

type RemoveUserLanguagesVars = {
  language: { userId: string; name: string[] };
};

export function useRemoveUserLanguages({
  userId,
  onSuccess,
}: UseRemoveUserLanguagesOptions) {
  const { handleDelete, loading, t } = useDeleteEntity<
    unknown,
    RemoveUserLanguagesVars,
    [names: string[]]
  >({
    mutation: DELETE_PROFILE_LANGUAGE_MUTATION,
    successMessageKey: 'users.languages.removeSuccess',
    errorContext: 'Remove user languages',
    buildVariables: (names) => ({ language: { userId, name: names } }),
    onSuccess,
  });

  const handleRemove = (names: string[]) => {
    if (names.length === 0) return Promise.resolve(false);
    return handleDelete(names);
  };

  return { handleRemove, loading, t };
}
