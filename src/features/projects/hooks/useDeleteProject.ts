import { DELETE_PROJECT_MUTATION, PROJECTS_QUERY } from '@/api/projects';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type DeleteProjectData = {
  deleteProject: { affected: number };
};

type DeleteProjectVars = {
  project: { projectId: string };
};

type UseDeleteProjectOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeleteProject(options: UseDeleteProjectOptions = {}) {
  const { handleDelete, loading } = useDeleteEntity<
    DeleteProjectData,
    DeleteProjectVars,
    [projectId: string]
  >({
    mutation: DELETE_PROJECT_MUTATION,
    successMessageKey: 'projects.notifications.deleteSuccess',
    defaultSuccessMessage: 'Project has been successfully deleted',
    errorContext: 'Delete Project',
    buildVariables: (projectId) => ({ project: { projectId } }),
    isSuccessCheck: (data) => Boolean(data?.deleteProject?.affected),
    onSuccess: options.onSuccess,
    mutationOptions: {
      refetchQueries: [PROJECTS_QUERY],
      awaitRefetchQueries: true,
    },
  });

  return { handleDelete, loading };
}
