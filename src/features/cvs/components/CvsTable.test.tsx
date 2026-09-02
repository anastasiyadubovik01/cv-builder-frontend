import type { ReactNode } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
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
  getRowKey: (cv: Cv) => string;
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
    getRowKey,
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
        const rowKey = getRowKey(cv);
        const subRow = renderSubRow?.(cv);

        return (
          <div key={rowKey} data-testid={`row-${rowKey}`}>
            {columns.map((column) => (
              <div key={column.id}>
                <span>{column.header}</span>

                {column.sortKey && (
                  <button type="button" onClick={() => onSort(column.sortKey!)}>
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
      href?: string;
      onClick?: () => void;
    }>;
  }) => (
    <div data-testid={`actions-${ariaLabel}`} data-open={String(open)}>
      <span>{ariaLabel}</span>

      <button type="button" onClick={() => onOpenChange(true)}>
        Open {ariaLabel}
      </button>

      <button type="button" onClick={() => onOpenChange(false)}>
        Close {ariaLabel}
      </button>

      {actions.map((action) =>
        action.href ? (
          <a key={action.label} href={action.href}>
            {action.label}
          </a>
        ) : (
          <button key={action.label} type="button" onClick={action.onClick}>
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
    <div data-testid="update-modal">
      <span>Update modal: {cvId}</span>
      <span>{initialValues.name}</span>
      <span>{initialValues.education}</span>
      <span>{initialValues.description}</span>

      <button type="button" onClick={() => onOpenChange(true)}>
        Keep update open
      </button>

      <button type="button" onClick={() => onOpenChange(false)}>
        Close update
      </button>

      <button type="button" onClick={() => void onSuccess()}>
        Update success
      </button>
    </div>
  ),
}));

vi.mock('./modals/DeleteCvModal', () => ({
  DeleteCvModal: ({
    cvId,
    name,
    onOpenChange,
    onSuccess,
  }: {
    cvId: string;
    name: string;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void | Promise<void>;
  }) => (
    <div data-testid="delete-modal">
      <span>Delete modal: {name}</span>
      <span>Delete id: {cvId}</span>

      <button type="button" onClick={() => onOpenChange(true)}>
        Keep delete open
      </button>

      <button type="button" onClick={() => onOpenChange(false)}>
        Close delete
      </button>

      <button type="button" onClick={() => void onSuccess()}>
        Delete success
      </button>
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

  it('uses CV id as row key', () => {
    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    expect(screen.getByTestId('row-cv-1')).toBeInTheDocument();
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
    const cvWithoutDescription: Cv = {
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

  it('opens and closes row actions menu', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    const menu = screen.getByTestId('actions-Actions for Frontend CV');

    expect(menu).toHaveAttribute('data-open', 'false');

    await user.click(
      screen.getByRole('button', {
        name: 'Open Actions for Frontend CV',
      }),
    );

    expect(
      screen.getByTestId('actions-Actions for Frontend CV'),
    ).toHaveAttribute('data-open', 'true');

    await user.click(
      screen.getByRole('button', {
        name: 'Close Actions for Frontend CV',
      }),
    );

    expect(
      screen.getByTestId('actions-Actions for Frontend CV'),
    ).toHaveAttribute('data-open', 'false');
  });

  it('switches opened menu between CVs', async () => {
    const user = userEvent.setup();

    const secondCv: Cv = {
      ...cv,
      id: 'cv-2',
      name: 'Backend CV',
    };

    render(
      <CvsTable
        cvs={[cv, secondCv]}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Open Actions for Frontend CV',
      }),
    );

    expect(
      screen.getByTestId('actions-Actions for Frontend CV'),
    ).toHaveAttribute('data-open', 'true');

    expect(
      screen.getByTestId('actions-Actions for Backend CV'),
    ).toHaveAttribute('data-open', 'false');

    await user.click(
      screen.getByRole('button', {
        name: 'Open Actions for Backend CV',
      }),
    );

    expect(
      screen.getByTestId('actions-Actions for Frontend CV'),
    ).toHaveAttribute('data-open', 'false');

    expect(
      screen.getByTestId('actions-Actions for Backend CV'),
    ).toHaveAttribute('data-open', 'true');
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

    const modal = screen.getByTestId('update-modal');

    expect(within(modal).getByText('Update modal: cv-1')).toBeInTheDocument();

    expect(
      within(modal).getByText('Frontend developer CV'),
    ).toBeInTheDocument();
  });

  it('keeps update modal open when onOpenChange receives true', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Keep update open',
      }),
    );

    expect(screen.getByTestId('update-modal')).toBeInTheDocument();
  });

  it('closes update modal when onOpenChange receives false', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Update',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Close update',
      }),
    );

    expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
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

    expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
  });

  it('closes update modal after success without onRefresh', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
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
      expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
    });
  });

  it('opens delete modal with CV data', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    const modal = screen.getByTestId('delete-modal');

    expect(
      within(modal).getByText('Delete modal: Frontend CV'),
    ).toBeInTheDocument();

    expect(within(modal).getByText('Delete id: cv-1')).toBeInTheDocument();
  });

  it('keeps delete modal open when onOpenChange receives true', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Keep delete open',
      }),
    );

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
  });

  it('closes delete modal when onOpenChange receives false', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Close delete',
      }),
    );

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
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

    await user.click(
      screen.getByRole('button', {
        name: 'Delete success',
      }),
    );

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
  });

  it('closes delete modal after success without onRefresh', async () => {
    const user = userEvent.setup();

    render(
      <CvsTable cvs={[cv]} sortBy="name" sortDirection="asc" onSort={onSort} />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete',
      }),
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Delete success',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByTestId('delete-modal')).not.toBeInTheDocument();
    });
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
