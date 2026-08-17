import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_CV_MUTATION } from '@/api/cvs';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

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

      const isSuccess = Boolean(response.data?.deleteCv?.affected);

      if (isSuccess) {
        toast.success(
          t(
            'cvs.notifications.deleteSuccess',
            'The CV was successfully deleted!',
          ),
        );
      }
      return isSuccess;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Delete CV',
      });
      return false;
    }
  };

  return {
    handleDelete,
    loading,
    t,
  };
}
