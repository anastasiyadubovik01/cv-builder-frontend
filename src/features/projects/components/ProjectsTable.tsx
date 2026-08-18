'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';
import { Badge } from '@/components/ui/badge';

import type { Project, ProjectSortField, SortDirection } from '../types';

type ProjectsTableProps = {
  projects: Project[];
  sortBy: ProjectSortField;
  sortDirection: SortDirection;
  onSort: (field: ProjectSortField) => void;
};

export function ProjectsTable({
  projects,
  sortBy,
  sortDirection,
  onSort,
}: ProjectsTableProps) {
  const { t } = useTranslation();
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(
    null,
  );

  const columns: DataTableColumn<Project, ProjectSortField>[] = [
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
      render: (project) => project.endDate,
    },
    {
      id: 'actions',
      header: '',
      widthClassName: 'w-10',
      render: (project) => (
        <RowActionsMenu
          open={openMenuProjectId === project.id}
          onOpenChange={(open) =>
            setOpenMenuProjectId(open ? project.id : null)
          }
          ariaLabel={`Actions for ${project.name}`}
          actions={[
            {
              label: t('dialogs.actions.view', 'View'),
              href: `/projects/${project.id}`,
            },
            {
              label: t('dialogs.actions.update', 'Update'),
              onClick: () => {
                // update
              },
            },
            {
              label: t('dialogs.actions.delete', 'Delete'),
              onClick: () => {
                // delete
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <DataTable
      data={projects}
      columns={columns}
      getRowKey={(project) => project.id}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      emptyState={t('projects.emptyState', 'No projects found')}
      renderSubRow={(project) => {
        const hasDescription = Boolean(project.description);
        const hasSkills = Boolean(project.environmentSkills?.length);

        if (!hasDescription && !hasSkills) return null;

        return (
          <div className="flex flex-col gap-3 py-1">
            {hasDescription && (
              <p
                className="text-[16px] font-regular leading-relaxed"
                style={{ color: 'var(--users-foreground)', opacity: 0.5 }}
              >
                {project.description}
              </p>
            )}

            {hasSkills && (
              <div className="flex flex-wrap items-center gap-2">
                {project.environmentSkills?.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
