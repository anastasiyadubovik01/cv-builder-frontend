'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { RowActionsMenu } from '@/components/ui/row-actions-menu';
import { Badge } from '@/components/ui/badge';

import type {
  CvProject,
  CvProjectSortField,
  SortDirection,
} from '@/features/cvs/types';

type CvProjectsTableProps = {
  projects: CvProject[];
  sortBy: CvProjectSortField;
  sortDirection: SortDirection;
  onSort: (field: CvProjectSortField) => void;
  hasSearchQuery?: boolean;
};

export function CvProjectsTable({
  projects,
  sortBy,
  sortDirection,
  onSort,
  hasSearchQuery = false,
}: CvProjectsTableProps) {
  const { t } = useTranslation();

  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(
    null,
  );

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
      render: (project) => (
        <RowActionsMenu
          open={openMenuProjectId === project.id}
          onOpenChange={(open) =>
            setOpenMenuProjectId(open ? project.id : null)
          }
          ariaLabel={`Actions for ${project.name}`}
          actions={[
            {
              label: t('dialogs.actions.update', 'Update'),
              onClick: () => {},
            },
            {
              label: t('dialogs.actions.delete', 'Delete'),
              onClick: () => {},
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
      emptyState={emptyStateMessage}
      renderSubRow={(project) => {
        const hasDescription = Boolean(project.description);
        const hasResponsibilities = Boolean(project.responsibilities?.length);

        if (!hasDescription && !hasResponsibilities) return null;

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

            {hasResponsibilities && (
              <div className="flex flex-wrap items-center gap-2">
                {project.responsibilities.map((resp) => (
                  <Badge key={resp}>{resp}</Badge>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
