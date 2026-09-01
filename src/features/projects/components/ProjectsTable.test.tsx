import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Project, ProjectSortField } from '../types';
import { ProjectsTable } from './ProjectsTable';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

type MockColumn = {
  id: string;
  header: ReactNode;
  sortKey?: ProjectSortField;
  render: (project: Project) => ReactNode;
};

type MockDataTableProps = {
  data: Project[];
  columns: MockColumn[];
  sortBy: ProjectSortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: ProjectSortField) => void;
  emptyState: ReactNode;
  renderSubRow?: (project: Project) => ReactNode;
};

vi.mock('@/components/ui/data-table', () => ({
  DataTable: vi.fn(
    ({
      data,
      columns,
      sortBy,
      sortDirection,
      onSort,
      emptyState,
      renderSubRow,
    }: MockDataTableProps) => (
      <div>
        <div data-testid="sort-state">
          {sortBy}-{sortDirection}
        </div>

        {data.length === 0 && <div>{emptyState}</div>}

        {data.map((project) => {
          const subRow = renderSubRow?.(project);

          return (
            <div key={project.id}>
              {columns.map((column) => (
                <div key={column.id}>
                  <span>{column.header}</span>

                  {column.sortKey && (
                    <button onClick={() => onSort(column.sortKey!)}>
                      Sort {column.id}
                    </button>
                  )}

                  <div>{column.render(project)}</div>
                </div>
              ))}

              {subRow && (
                <div data-testid={`subrow-${project.id}`}>{subRow}</div>
              )}
            </div>
          );
        })}
      </div>
    ),
  ),
}));

vi.mock('@/components/ui/row-actions-menu', () => ({
  RowActionsMenu: vi.fn(
    ({
      open,
      onOpenChange,
      ariaLabel,
      actions,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      ariaLabel: string;
      actions: Array<{
        label: string;
        onClick: () => void;
      }>;
    }) => (
      <div>
        <button onClick={() => onOpenChange(!open)}>
          {open ? 'Close menu' : ariaLabel}
        </button>

        {actions.map((action) => (
          <button key={action.label} onClick={action.onClick}>
            {action.label}
          </button>
        ))}
      </div>
    ),
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock('./modals/UpdateProjectModal', () => ({
  UpdateProjectModal: ({
    project,
    onOpenChange,
    onSuccess,
  }: {
    project: Project;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void | Promise<void>;
  }) => (
    <div>
      <span>Update modal: {project.name}</span>

      <button onClick={() => onOpenChange(false)}>Close update</button>

      <button onClick={() => void onSuccess?.()}>Update success</button>
    </div>
  ),
}));

vi.mock('./modals/DeleteProjectModal', () => ({
  DeleteProjectModal: ({
    name,
    onOpenChange,
    onSuccess,
  }: {
    name: string;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void | Promise<void>;
  }) => (
    <div>
      <span>Delete modal: {name}</span>

      <button onClick={() => onOpenChange(false)}>Close delete</button>

      <button onClick={() => void onSuccess()}>Delete success</button>
    </div>
  ),
}));

describe('ProjectsTable', () => {
  const t = vi.fn();
  const onSort = vi.fn();

  const project: Project = {
    id: 'project-1',
    name: 'CV Builder',
    domain: 'HR',
    startDate: '2024-01-01',
    endDate: 'Present',
    description: 'CV management application',
    environmentSkills: ['React', 'TypeScript'],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );
  });

  it('renders project data and current sorting state', () => {
    render(
      <ProjectsTable
        projects={[project]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    expect(screen.getByText('CV Builder')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Present')).toBeInTheDocument();

    expect(screen.getByTestId('sort-state')).toHaveTextContent('name-asc');
  });

  it('calls onSort when sortable column is selected', async () => {
    const user = userEvent.setup();

    render(
      <ProjectsTable
        projects={[project]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Sort startDate',
      }),
    );

    expect(onSort).toHaveBeenCalledWith('startDate');
  });

  it('renders description and environment skills in sub row', () => {
    render(
      <ProjectsTable
        projects={[project]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    const subRow = screen.getByTestId('subrow-project-1');

    expect(subRow).toHaveTextContent('CV management application');
    expect(subRow).toHaveTextContent('React');
    expect(subRow).toHaveTextContent('TypeScript');
  });

  it('does not render sub row when project has no description or skills', () => {
    const projectWithoutDetails: Project = {
      ...project,
      id: 'project-2',
      description: '',
      environmentSkills: [],
    };

    render(
      <ProjectsTable
        projects={[projectWithoutDetails]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    expect(screen.queryByTestId('subrow-project-2')).not.toBeInTheDocument();
  });

  it('opens update modal and calls update success callback', async () => {
    const user = userEvent.setup();
    const onUpdateSuccess = vi.fn();

    render(
      <ProjectsTable
        projects={[project]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        onUpdateSuccess={onUpdateSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update',
      }),
    );

    expect(screen.getByText('Update modal: CV Builder')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Update success',
      }),
    );

    expect(onUpdateSuccess).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole('button', {
        name: 'Close update',
      }),
    );

    expect(
      screen.queryByText('Update modal: CV Builder'),
    ).not.toBeInTheDocument();
  });

  it('deletes project, closes modal and calls delete success callback', async () => {
    const user = userEvent.setup();
    const onDeleteSuccess = vi.fn();

    render(
      <ProjectsTable
        projects={[project]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        onDeleteSuccess={onDeleteSuccess}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(screen.getByText('Delete modal: CV Builder')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Delete success',
      }),
    );

    await waitFor(() => {
      expect(onDeleteSuccess).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByText('Delete modal: CV Builder'),
    ).not.toBeInTheDocument();
  });

  it('renders empty state when there are no projects', () => {
    render(
      <ProjectsTable
        projects={[]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });
});
