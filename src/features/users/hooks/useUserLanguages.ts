import { useQuery } from '@apollo/client/react';
import { LANGUAGES_QUERY, USER_LANGUAGES_QUERY } from '@/api/languages';

export function useUserLanguages(userId: string) {
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUserLanguages,
  } = useQuery(USER_LANGUAGES_QUERY, {
    variables: {
      userId,
    },
  });

  const {
    data: languagesData,
    loading: languagesLoading,
    error: languagesError,
    refetch: refetchLanguages,
  } = useQuery(LANGUAGES_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  const loading = userLoading || languagesLoading;
  const error = userError || languagesError;

  const handleRefresh = async () => {
    await Promise.all([refetchUserLanguages(), refetchLanguages()]);
  };

  const profileLanguages = userData?.user.profile.languages ?? [];
  const availableLanguages = languagesData?.languages.items ?? [];

  return {
    profileLanguages,
    availableLanguages,
    loading,
    error: Boolean(error),
    refetchUserLanguages,
    handleRefresh,
  };
}
