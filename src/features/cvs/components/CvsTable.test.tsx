import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Cv, SortField } from '../types';
import { CvsTable } from './CvsTable';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

type MockColumn = {
  id: string;
  header: ReactNode;
  sortKey?: SortField;
  render: (cv: Cv) => ReactNode;
};

type MockDataTableProps = {
  data: Cv[];
  columns: MockColumn[];
  sortBy: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  emptyState: ReactNode;
  renderSubRow?: (cv: Cv) => ReactNode;
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

      {data.map((cv) => {
        const subRow = renderSubRow?.(cv);

        return (
          <div key={cv.id}>
            {columns.map((column) => (
              <div key={column.id}>
                <span>{column.header}</span>

                {column.sortKey && (
                  <button onClick={() => onSort(column.sortKey!)}>
                    Sort {column.id}
                  </button>
                )}

                <div>{column.render(cv)}</div>
              </div>
            ))}

            {subRow && <div data-testid={`subrow-${cv.id}`}>{subRow}</div>}
          </div>
        );
      })}
    </div>
  ),
}));

vi.mock('@/components/ui/row-actions-menu', () => ({
  RowActionsMenu: ({
    ariaLabel,
    actions,
  }: {
    ariaLabel: string;
    actions: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
    }>;
  }) => (
    <div>
      <span>{ariaLabel}</span>

      {actions.map((action) =>
        action.href ? (
          <a key={action.label} href={action.href}>
            {action.label}
          </a>
        ) : (
          <button key={action.label} onClick={action.onClick}>
            {action.label}
          </button>
        ),
      )}
    </div>
  ),
}));

vi.mock('./modals/UpdateCvModal', () => ({
  UpdateCvModal: ({
    cvId,
    initialValues,
    onOpenChange,
    onSuccess,
  }: {
    cvId: string;
    initialValues: {
      name: string;
      education: string;
      description: string;
    };
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void | Promise<void>;
  }) => (
    <div>
      <span>Update modal: {cvId}</span>
      <span>{initialValues.name}</span>

      <button onClick={() => onOpenChange(false)}>Close update</button>
      <button onClick={() => void onSuccess()}>Update success</button>
    </div>
  ),
}));

vi.mock('./modals/DeleteCvModal', () => ({
  DeleteCvModal: ({
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

describe('CvsTable', () => {
  const t = vi.fn();
  const onSort = vi.fn();

  const cv: Cv = {
    id: 'cv-1',
    name: 'Frontend CV',
    education: 'BSU',
    employee: 'nastya@example.com',
    description: 'Frontend developer CV',
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

  it('renders CV data and sorting state', () => {
    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    expect(screen.getByText('Frontend CV')).toBeInTheDocument();
    expect(screen.getByText('BSU')).toBeInTheDocument();
    expect(screen.getByText('nastya@example.com')).toBeInTheDocument();

    expect(screen.getByTestId('sort-state')).toHaveTextContent('name-asc');
  });

  it('calls onSort for name column', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Sort name',
      }),
    );

    expect(onSort).toHaveBeenCalledWith('name');
  });

  it('renders CV description in sub row', () => {
    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    expect(screen.getByTestId('subrow-cv-1')).toHaveTextContent(
      'Frontend developer CV',
    );
  });

  it('does not render sub row without description', () => {
    const cvWithoutDescription = {
      ...cv,
      id: 'cv-2',
      description: '',
    };

    render(
      <CvsTable
        cvs={[cvWithoutDescription]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    expect(screen.queryByTestId('subrow-cv-2')).not.toBeInTheDocument();
  });

  it('provides view link for CV', () => {
    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    expect(
      screen.getByRole('link', {
        name: 'View',
      }),
    ).toHaveAttribute('href', '/cvs/cv-1');
  });

  it('opens update modal with CV data', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update',
      }),
    );

    expect(screen.getByText('Update modal: cv-1')).toBeInTheDocument();
  });

  it('refreshes and closes modal after successful update', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue(undefined);

    render(
      <CvsTable
        cvs={[cv]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        onRefresh={onRefresh}
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
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('Update modal: cv-1')).not.toBeInTheDocument();
  });

  it('refreshes and closes modal after successful delete', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue(undefined);

    render(
      <CvsTable
        cvs={[cv]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        onRefresh={onRefresh}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    expect(screen.getByText('Delete modal: Frontend CV')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Delete success',
      }),
    );

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.queryByText('Delete modal: Frontend CV'),
    ).not.toBeInTheDocument();
  });

  it('renders employee empty state by default', () => {
    render(
      <CvsTable cvs={[]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    expect(screen.getByText('You have no CVs yet')).toBeInTheDocument();
  });

  it('renders admin empty state for admin', () => {
    render(
      <CvsTable
        cvs={[]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        isAdmin
      />,
    );

    expect(screen.getByText('No CVs found')).toBeInTheDocument();
  });
});
