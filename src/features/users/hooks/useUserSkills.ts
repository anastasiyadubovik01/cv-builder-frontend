import { useQuery } from '@apollo/client/react';
import { SKILLS_QUERY, USER_SKILLS_QUERY } from '@/api/skills';

export function useUserSkills(userId: string) {
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useQuery(USER_SKILLS_QUERY, {
    variables: {
      userId,
    },
  });

  const {
    data: skillsData,
    loading: skillsLoading,
    error: skillsError,
    refetch: refetchSkills,
  } = useQuery(SKILLS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  const loading = userLoading || skillsLoading;
  const error = userError || skillsError;

  const handleRefetch = async () => {
    await Promise.all([refetchUser(), refetchSkills()]);
  };

  const profileSkills = userData?.user.profile.skills ?? [];
  const availableSkills = skillsData?.skills.items ?? [];

  return {
    profileSkills,
    availableSkills,
    loading,
    error: Boolean(error),
    handleRefetch,
  };
}
