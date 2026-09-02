import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataTable, type DataTableColumn } from './data-table';

vi.mock('@/components/icons/sort-arrow-icon', () => ({
  SortArrowIcon: ({ className }: { className?: string }) => (
    <span data-testid="sort-arrow" className={className} />
  ),
}));

type User = {
  id: string;
  name: string;
  email: string;
};

type SortKey = 'name' | 'email';

describe('DataTable', () => {
  const data: User[] = [
    {
      id: '1',
      name: 'Alice',
      email: 'alice@test.com',
    },
    {
      id: '2',
      name: 'Bob',
      email: 'bob@test.com',
    },
  ];

  const nameRender = vi.fn((user: User) => user.name);

  const emailRender = vi.fn((user: User) => user.email);

  const getRowKey = vi.fn((user: User) => user.id);

  const onSort = vi.fn();

  const columns: DataTableColumn<User, SortKey>[] = [
    {
      id: 'name',
      sortKey: 'name',
      header: 'Name',
      widthClassName: 'w-1/2',
      className: 'name-column',
      render: nameRender,
    },
    {
      id: 'email',
      sortKey: 'email',
      header: 'Email',
      render: emailRender,
    },
    {
      id: 'actions',
      header: 'Actions',
      render: () => 'View',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers and data', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
      />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();

    expect(screen.getByText('Email')).toBeInTheDocument();

    expect(screen.getByText('Actions')).toBeInTheDocument();

    expect(screen.getByText('Alice')).toBeInTheDocument();

    expect(screen.getByText('Bob')).toBeInTheDocument();

    expect(screen.getByText('alice@test.com')).toBeInTheDocument();

    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('calls render function for every column and row', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
      />,
    );

    expect(nameRender).toHaveBeenCalledTimes(2);
    expect(emailRender).toHaveBeenCalledTimes(2);

    expect(nameRender).toHaveBeenNthCalledWith(1, data[0]);

    expect(nameRender).toHaveBeenNthCalledWith(2, data[1]);
  });

  it('uses getRowKey for every data item', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
      />,
    );

    expect(getRowKey).toHaveBeenCalledTimes(2);

    expect(getRowKey).toHaveBeenNthCalledWith(1, data[0]);

    expect(getRowKey).toHaveBeenNthCalledWith(2, data[1]);
  });

  it('renders empty state when data is empty', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        getRowKey={getRowKey}
        emptyState={<div data-testid="empty-state">No users found</div>}
      />,
    );

    expect(screen.getByTestId('empty-state')).toHaveTextContent(
      'No users found',
    );

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();

    expect(getRowKey).not.toHaveBeenCalled();
  });

  it('sets empty state colspan to number of columns', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
      />,
    );

    const emptyCell = screen.getByText('No users').closest('td');

    expect(emptyCell).toHaveAttribute('colspan', '3');
  });

  it('renders sortable headers as buttons when onSort is provided', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Name',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Email',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Actions',
      }),
    ).not.toBeInTheDocument();
  });

  it('does not render sort buttons when onSort is missing', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
      />,
    );

    expect(
      screen.queryByRole('button', {
        name: 'Name',
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Email',
      }),
    ).not.toBeInTheDocument();
  });

  it('calls onSort with column sort key', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        onSort={onSort}
        emptyState="No users"
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Name',
      }),
    );

    expect(onSort).toHaveBeenCalledWith('name');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Email',
      }),
    );

    expect(onSort).toHaveBeenCalledWith('email');
  });

  it('sets ascending aria-sort for active ascending column', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(
      screen.getByRole('columnheader', {
        name: 'Name',
      }),
    ).toHaveAttribute('aria-sort', 'ascending');

    expect(
      screen.getByRole('columnheader', {
        name: 'Email',
      }),
    ).toHaveAttribute('aria-sort', 'none');
  });

  it('sets descending aria-sort for active descending column', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        sortBy="email"
        sortDirection="desc"
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(
      screen.getByRole('columnheader', {
        name: 'Email',
      }),
    ).toHaveAttribute('aria-sort', 'descending');

    expect(
      screen.getByRole('columnheader', {
        name: 'Name',
      }),
    ).toHaveAttribute('aria-sort', 'none');
  });

  it('does not set aria-sort for columns without sortKey', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(
      screen.getByRole('columnheader', {
        name: 'Actions',
      }),
    ).not.toHaveAttribute('aria-sort');
  });

  it('renders sort arrow only for active sort column', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(screen.getAllByTestId('sort-arrow')).toHaveLength(1);

    const nameHeader = screen.getByRole('columnheader', {
      name: 'Name',
    });

    expect(within(nameHeader).getByTestId('sort-arrow')).toBeInTheDocument();
  });

  it('does not rotate arrow for ascending sorting', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(screen.getByTestId('sort-arrow')).toHaveClass('size-[18px]');

    expect(screen.getByTestId('sort-arrow')).not.toHaveClass('rotate-180');
  });

  it('rotates arrow for descending sorting', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        sortBy="name"
        sortDirection="desc"
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(screen.getByTestId('sort-arrow')).toHaveClass('rotate-180');
  });

  it('does not render sort arrow when no column is active', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        onSort={onSort}
        emptyState="No users"
      />,
    );

    expect(screen.queryByTestId('sort-arrow')).not.toBeInTheDocument();
  });

  it('applies optional width and custom classes', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
      />,
    );

    const header = screen.getByRole('columnheader', {
      name: 'Name',
    });

    expect(header).toHaveClass('w-1/2');
    expect(header).toHaveClass('name-column');

    const aliceCell = screen.getByText('Alice').closest('td');

    expect(aliceCell).toHaveClass('w-1/2');
    expect(aliceCell).toHaveClass('name-column');
  });

  it('renders rows with divider when sub rows are not enabled', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
      />,
    );

    const aliceRow = screen.getByText('Alice').closest('tr');

    expect(aliceRow).toHaveClass('border-b');
    expect(aliceRow).toHaveClass('border-[var(--users-divider)]');
  });

  it('renders sub row when renderSubRow returns content', () => {
    const renderSubRow = vi.fn((user: User) => (
      <div>Details for {user.name}</div>
    ));

    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
        renderSubRow={renderSubRow}
      />,
    );

    expect(screen.getByText('Details for Alice')).toBeInTheDocument();

    expect(screen.getByText('Details for Bob')).toBeInTheDocument();

    expect(renderSubRow).toHaveBeenCalledTimes(2);
  });

  it('sets sub row colspan to number of columns', () => {
    render(
      <DataTable
        data={[data[0]]}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
        renderSubRow={() => <div>Additional information</div>}
      />,
    );

    const subRowCell = screen.getByText('Additional information').closest('td');

    expect(subRowCell).toHaveAttribute('colspan', '3');
  });

  it('does not add divider to main row when sub rows are enabled', () => {
    render(
      <DataTable
        data={[data[0]]}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
        renderSubRow={() => <div>Additional information</div>}
      />,
    );

    const mainRow = screen.getByText('Alice').closest('tr');

    expect(mainRow).not.toHaveClass('border-b');
  });

  it('does not render sub row when renderSubRow returns nothing', () => {
    const renderSubRow = vi.fn(() => null);

    render(
      <DataTable
        data={[data[0]]}
        columns={columns}
        getRowKey={getRowKey}
        emptyState="No users"
        renderSubRow={renderSubRow}
      />,
    );

    expect(renderSubRow).toHaveBeenCalledWith(data[0]);

    expect(screen.getAllByRole('row')).toHaveLength(2);
  });
});
