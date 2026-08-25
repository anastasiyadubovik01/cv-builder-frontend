import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_PROJECT_MUTATION, PROJECTS_QUERY } from '@/api/projects';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type DeleteProjectData = {
  deleteProject: {
    affected: number;
  };
};

type DeleteProjectVariables = {
  project: {
    projectId: string;
  };
};

type UseDeleteProjectOptions = {
  onSuccess?: () => void;
};

export function useDeleteProject(options: UseDeleteProjectOptions = {}) {
  const { t } = useTranslation();
  const toast = useToast();
  const [deleteProject, { loading }] = useMutation<
    DeleteProjectData,
    DeleteProjectVariables
  >(DELETE_PROJECT_MUTATION, {
    refetchQueries: [PROJECTS_QUERY],
    awaitRefetchQueries: true,
  });

  const handleDelete = async (projectId: string): Promise<boolean> => {
    try {
      const response = await deleteProject({
        variables: {
          project: {
            projectId,
          },
        },
      });

      const isSuccess = Boolean(response.data?.deleteProject?.affected);

      if (isSuccess) {
        toast.success(
          t(
            'projects.notifications.deleteSuccess',
            'Project has been successfully deleted',
          ),
        );
        options.onSuccess?.();
      }
      return isSuccess;
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Delete Project',
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
