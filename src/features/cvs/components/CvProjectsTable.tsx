'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';
import { Badge } from '@/components/ui/badge';
import type { ApiCvProject } from '@/api/cv-projects';
import type {
  CvProject,
  CvProjectSortField,
  SortDirection,
} from '@/features/cvs/types';
import { UpdateCvProjectModal } from '@/features/cvs/components/modals/UpdateCvProjectModal';
import { RemoveCvProjectModal } from '@/features/cvs/components/modals/RemoveCvProjectModal';

type CvProjectsTableProps = {
  cvId: string;
  projects: CvProject[];
  rawProjects?: ApiCvProject[];
  sortBy: CvProjectSortField;
  sortDirection: SortDirection;
  onSort: (field: CvProjectSortField) => void;
  hasSearchQuery?: boolean;
  onRefetch?: () => void | Promise<void>;
};

export function CvProjectsTable({
  cvId,
  projects,
  rawProjects = [],
  sortBy,
  sortDirection,
  onSort,
  hasSearchQuery = false,
  onRefetch,
}: CvProjectsTableProps) {
  const { t } = useTranslation();

  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(
    null,
  );
  const [editingProject, setEditingProject] = useState<ApiCvProject | null>(
    null,
  );
  const [deletingProject, setDeletingProject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const emptyStateMessage = hasSearchQuery
    ? t('projects.noResults', 'No projects found')
    : t('projects.emptyState', 'No projects added yet');

  const columns: DataTableColumn<CvProject, CvProjectSortField>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: t('projects.name', 'Name'),
      render: (project) => project.name,
    },
    {
      id: 'domain',
      header: t('projects.domain', 'Domain'),
      render: (project) => project.domain,
    },
    {
      id: 'startDate',
      sortKey: 'startDate',
      header: t('projects.startDate', 'Start Date'),
      render: (project) => project.startDate,
    },
    {
      id: 'endDate',
      sortKey: 'endDate',
      header: t('projects.endDate', 'End Date'),
      render: (project) => project.endDate ?? '',
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (project) => {
        const rawProject = rawProjects.find((p) => p.id === project.id);
        const realProjectId = rawProject?.project?.id || project.id;

        return (
          <RowActionsMenu
            open={openMenuProjectId === project.id}
            onOpenChange={(open) =>
              setOpenMenuProjectId(open ? project.id : null)
            }
            ariaLabel={`Actions for ${project.name}`}
            actions={[
              {
                label: t('dialogs.actions.update', 'Update'),
                onClick: () => {
                  if (rawProject) {
                    setEditingProject(rawProject);
                  }
                  setOpenMenuProjectId(null);
                },
              },
              {
                label: t('dialogs.actions.delete', 'Delete'),
                onClick: () => {
                  setDeletingProject({
                    id: realProjectId,
                    name: project.name,
                  });
                  setOpenMenuProjectId(null);
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        data={projects}
        columns={columns}
        getRowKey={(project) => project.id}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={onSort}
        emptyState={emptyStateMessage}
        renderSubRow={(project) => {
          const hasDescription = Boolean(project.description);

          const parsedResponsibilities = (project.responsibilities || [])
            .flatMap((item) => item.split(','))
            .map((item) => item.trim())
            .filter(Boolean);

          const hasResponsibilities = parsedResponsibilities.length > 0;

          if (!hasDescription && !hasResponsibilities) return null;

          return (
            <div className="flex flex-col gap-4.5">
              {hasDescription && (
                <p
                  className="text-[16px] font-regular leading-relaxed"
                  style={{ color: 'var(--users-foreground)', opacity: 0.5 }}
                >
                  {project.description}
                </p>
              )}

              {hasResponsibilities && (
                <div className="flex flex-wrap items-center gap-2">
                  {parsedResponsibilities.map((resp, idx) => (
                    <Badge variant="secondary" key={`${resp}-${idx}`}>
                      {resp}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      />

      {editingProject && (
        <UpdateCvProjectModal
          cvId={cvId}
          project={editingProject}
          open={Boolean(editingProject)}
          onOpenChange={(open) => {
            if (!open) setEditingProject(null);
          }}
          onSuccess={async () => {
            setEditingProject(null);
            await onRefetch?.();
          }}
        />
      )}

      {deletingProject && (
        <RemoveCvProjectModal
          cvId={cvId}
          projectId={deletingProject.id}
          name={deletingProject.name}
          open={Boolean(deletingProject)}
          onOpenChange={(open) => {
            if (!open) setDeletingProject(null);
          }}
          onSuccess={async () => {
            setDeletingProject(null);
            await onRefetch?.();
          }}
        />
      )}
    </>
  );
}
