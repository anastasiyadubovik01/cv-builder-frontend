import { useQuery } from '@apollo/client/react';
import { SKILLS_QUERY } from '@/api/skills';
import { CV_SKILLS_QUERY } from '@/api/cv-skills';

export function useCvSkills(cvId: string) {
  const {
    data: cvData,
    loading: cvLoading,
    error: cvError,
    refetch: refetchCvSkills,
  } = useQuery(CV_SKILLS_QUERY, {
    variables: { cvId },
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: skillsData,
    loading: skillsLoading,
    error: skillsError,
    refetch: refetchAllSkills,
  } = useQuery(SKILLS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  const loading = cvLoading || skillsLoading;
  const error = cvError || skillsError;

  const handleRefresh = async () => {
    await Promise.all([refetchCvSkills(), refetchAllSkills()]);
  };

  const cvSkills = cvData?.cv?.skills ?? [];
  const availableSkills = skillsData?.skills.items ?? [];

  return {
    cvSkills,
    availableSkills,
    loading,
    error: Boolean(error),
    handleRefresh,
  };
}
