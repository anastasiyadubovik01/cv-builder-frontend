import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ApiCvProject } from '@/api/cv-projects';
import type { CvProject, CvProjectSortField } from '@/features/cvs/types';

import { CvProjectsTable } from './CvProjectsTable';
import { UpdateCvProjectModal } from './modals/UpdateCvProjectModal';
import { RemoveCvProjectModal } from './modals/RemoveCvProjectModal';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

type MockColumn = {
  id: string;
  header: ReactNode;
  sortKey?: CvProjectSortField;
  render: (project: CvProject) => ReactNode;
};

type MockDataTableProps = {
  data: CvProject[];
  columns: MockColumn[];
  sortBy: CvProjectSortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: CvProjectSortField) => void;
  emptyState: ReactNode;
  renderSubRow?: (project: CvProject) => ReactNode;
};

vi.mock('@/components/ui/data-table', () => ({
  DataTable: ({
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

            {subRow && <div data-testid={`subrow-${project.id}`}>{subRow}</div>}
          </div>
        );
      })}
    </div>
  ),
}));

vi.mock('@/components/ui/row-actions-menu', () => ({
  RowActionsMenu: ({
    actions,
  }: {
    actions: Array<{
      label: string;
      onClick?: () => void;
    }>;
  }) => (
    <div>
      {actions.map((action) => (
        <button key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

vi.mock('./modals/UpdateCvProjectModal', () => ({
  UpdateCvProjectModal: vi.fn(
    ({
      project,
      onOpenChange,
      onSuccess,
    }: {
      project: ApiCvProject;
      onOpenChange: (open: boolean) => void;
      onSuccess: () => void | Promise<void>;
    }) => (
      <div>
        <span>Update modal: {project.id}</span>

        <button onClick={() => onOpenChange(false)}>Close update</button>

        <button onClick={() => void onSuccess()}>Update success</button>
      </div>
    ),
  ),
}));

vi.mock('./modals/RemoveCvProjectModal', () => ({
  RemoveCvProjectModal: vi.fn(
    ({
      projectId,
      name,
      onOpenChange,
      onSuccess,
    }: {
      projectId: string;
      name: string;
      onOpenChange: (open: boolean) => void;
      onSuccess: () => void | Promise<void>;
    }) => (
      <div>
        <span>
          Delete modal: {projectId} - {name}
        </span>

        <button onClick={() => onOpenChange(false)}>Close delete</button>

        <button onClick={() => void onSuccess()}>Delete success</button>
      </div>
    ),
  ),
}));

describe('CvProjectsTable', () => {
  const t = vi.fn();
  const onSort = vi.fn();

  const project: CvProject = {
    id: 'cv-project-1',
    name: 'CV Builder',
    domain: 'HR',
    responsibilities: ['frontend development, testing', ' mentoring '],
    startDate: '2024-01-01',
    endDate: null,
    description: 'CV management application',
    environment: ['React', 'TypeScript'],
    roles: ['Frontend Developer'],
  };

  const rawProject = {
    id: 'cv-project-1',
    project: {
      id: 'real-project-1',
      name: 'CV Builder',
    },
  } as ApiCvProject;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );
  });

  it('renders project data and Till now for missing end date', () => {
    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[rawProject]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    expect(screen.getByText('CV Builder')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Till now')).toBeInTheDocument();

    expect(screen.getByTestId('sort-state')).toHaveTextContent('name-asc');
  });

  it('calls onSort for sortable column', async () => {
    const user = userEvent.setup();

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[rawProject]}
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

  it('renders description and parsed responsibilities', () => {
    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[rawProject]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    const subRow = screen.getByTestId('subrow-cv-project-1');

    expect(subRow).toHaveTextContent('CV management application');

    expect(subRow).toHaveTextContent('Frontend development');
    expect(subRow).toHaveTextContent('Testing');
    expect(subRow).toHaveTextContent('Mentoring');
  });

  it('does not render sub row without description and responsibilities', () => {
    const projectWithoutDetails: CvProject = {
      ...project,
      id: 'cv-project-2',
      description: '',
      responsibilities: [],
    };

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[projectWithoutDetails]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    expect(screen.queryByTestId('subrow-cv-project-2')).not.toBeInTheDocument();
  });

  it('renders default empty state when no projects were added', () => {
    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    expect(screen.getByText('No projects added yet')).toBeInTheDocument();
  });

  it('renders search empty state when search query is active', () => {
    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        hasSearchQuery
      />,
    );

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });

  it('opens update modal with raw project', async () => {
    const user = userEvent.setup();

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[rawProject]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update',
      }),
    );

    expect(screen.getByText('Update modal: cv-project-1')).toBeInTheDocument();

    const props = vi.mocked(UpdateCvProjectModal).mock.calls[0][0];

    expect(props.cvId).toBe('cv-1');
    expect(props.project).toBe(rawProject);
  });

  it('does not open update modal when raw project is missing', async () => {
    const user = userEvent.setup();

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update',
      }),
    );

    expect(screen.queryByText(/Update modal:/)).not.toBeInTheDocument();
  });

  it('closes update modal and refetches after successful update', async () => {
    const user = userEvent.setup();
    const onRefetch = vi.fn().mockResolvedValue(undefined);

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[rawProject]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        onRefetch={onRefetch}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update success',
      }),
    );

    await waitFor(() => {
      expect(onRefetch).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByText('Update modal: cv-project-1'),
    ).not.toBeInTheDocument();
  });

  it('uses real project id when deleting linked project', async () => {
    const user = userEvent.setup();

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[rawProject]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    const props = vi.mocked(RemoveCvProjectModal).mock.calls[0][0];

    expect(props.cvId).toBe('cv-1');
    expect(props.projectId).toBe('real-project-1');
    expect(props.name).toBe('CV Builder');
  });

  it('falls back to CV project id when real project id is unavailable', async () => {
    const user = userEvent.setup();

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    const props = vi.mocked(RemoveCvProjectModal).mock.calls[0][0];

    expect(props.projectId).toBe('cv-project-1');
  });

  it('closes delete modal and refetches after successful deletion', async () => {
    const user = userEvent.setup();
    const onRefetch = vi.fn().mockResolvedValue(undefined);

    render(
      <CvProjectsTable
        cvId="cv-1"
        projects={[project]}
        rawProjects={[rawProject]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        onRefetch={onRefetch}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(
      screen.getByText('Delete modal: real-project-1 - CV Builder'),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Delete success',
      }),
    );

    await waitFor(() => {
      expect(onRefetch).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByText('Delete modal: real-project-1 - CV Builder'),
    ).not.toBeInTheDocument();
  });
});
