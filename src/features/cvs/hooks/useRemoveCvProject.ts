import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import {
  REMOVE_CV_PROJECT_MUTATION,
  type ApiCvProject,
} from '@/api/cv-projects';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type RemoveCvProjectData = {
  removeCvProject: {
    id: string;
    projects: ApiCvProject[];
  };
};

type RemoveCvProjectVariables = {
  project: {
    cvId: string;
    projectId: string;
  };
};

type UseRemoveCvProjectOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useRemoveCvProject(options: UseRemoveCvProjectOptions = {}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [removeCvProject, { loading }] = useMutation<
    RemoveCvProjectData,
    RemoveCvProjectVariables
  >(REMOVE_CV_PROJECT_MUTATION);

  const handleDelete = async (
    cvId: string,
    projectId: string,
  ): Promise<boolean> => {
    try {
      const response = await removeCvProject({
        variables: {
          project: {
            cvId,
            projectId,
          },
        },
      });

      const isSuccess = Boolean(response.data?.removeCvProject?.id);

      if (isSuccess) {
        toast.success(
          t(
            'projects.notifications.removeCvProjectSuccess',
            'Project has been successfully removed from CV',
          ),
        );
        await options.onSuccess?.();
      }
      return isSuccess;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Remove CV Project',
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
