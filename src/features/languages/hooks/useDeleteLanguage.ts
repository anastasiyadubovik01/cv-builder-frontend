import { DELETE_LANGUAGE_MUTATION } from '@/api/languages';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type DeleteLanguageData = {
  deleteLanguage: { affected: number };
};

type DeleteLanguageVars = {
  language: { languageId: string };
};

type UseDeleteLanguageOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeleteLanguage({
  onSuccess,
}: UseDeleteLanguageOptions = {}) {
  const { handleDelete, loading, t } = useDeleteEntity<
    DeleteLanguageData,
    DeleteLanguageVars,
    [languageId: string]
  >({
    mutation: DELETE_LANGUAGE_MUTATION,
    successMessageKey: 'languages.admin.notifications.deleteSuccess',
    errorContext: 'Delete Language',
    buildVariables: (languageId) => ({ language: { languageId } }),
    isSuccessCheck: (data) => Boolean(data?.deleteLanguage?.affected),
    onSuccess,
  });

  return { handleDelete, loading, t };
}
