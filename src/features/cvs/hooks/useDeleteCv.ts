import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { DELETE_CV_MUTATION } from '@/api/cvs';

type DeleteCvData = {
  deleteCv: {
    affected: number;
  };
};

type DeleteCvVariables = {
  cv: {
    cvId: string;
  };
};

export function useDeleteCv() {
  const { t } = useTranslation();

  const [deleteCv, { loading }] = useMutation<DeleteCvData, DeleteCvVariables>(
    DELETE_CV_MUTATION,
    {
      refetchQueries: ['Cvs'],
    },
  );

  const handleDelete = async (cvId: string): Promise<boolean> => {
    try {
      const response = await deleteCv({
        variables: {
          cv: {
            cvId,
          },
        },
      });

      return Boolean(response.data?.deleteCv?.affected);
    } catch (err) {
      console.error('Failed to delete CV:', err);
      return false;
    }
  };

  return {
    handleDelete,
    loading,
    t,
  };
}
