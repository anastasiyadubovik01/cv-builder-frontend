import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentLayout } from '@/components/common/ContentLayout';
import { useCvs } from '@/features/cvs/hooks/useCvs';

import { CvsContent } from './CvsContent';
import { CvsTable } from './CvsTable';
import { CreateCvModal } from './modals/CreateCvModal';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/features/cvs/hooks/useCvs', () => ({
  useCvs: vi.fn(),
}));

vi.mock('@/components/common/ContentLayout', () => ({
  ContentLayout: vi.fn(({ children, actionTrigger }) => (
    <div>
      {actionTrigger}
      {children}
    </div>
  )),
}));

vi.mock('./CvsTable', () => ({
  CvsTable: vi.fn(() => <div>CVs table</div>),
}));

vi.mock('./modals/CreateCvModal', () => ({
  CreateCvModal: vi.fn(({ trigger }) => <div>{trigger}</div>),
}));

describe('CvsContent', () => {
  const t = vi.fn();

  const setSearch = vi.fn();
  const handleSort = vi.fn();
  const setCurrentPage = vi.fn();
  const setPageSize = vi.fn();
  const handleRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    handleRefresh.mockResolvedValue([]);

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );

    vi.mocked(useCvs).mockReturnValue({
      allItems: [],
      paginatedItems: [
        {
          id: 'cv-1',
          name: 'Frontend CV',
          education: 'BSU',
          description: 'Frontend developer',
          user: {
            email: 'nastya@example.com',
          },
        },
        {
          id: 'cv-2',
          name: 'Backend CV',
          education: null,
          description: 'Backend developer',
          user: null,
        },
      ],
      loading: false,
      error: false,
      search: 'frontend',
      setSearch,
      sortBy: 'name',
      sortDirection: 'asc',
      handleSort,
      currentPage: 2,
      totalPages: 3,
      pageSize: 10,
      setCurrentPage,
      setPageSize,
      handleRefresh,
    } as never);
  });

  it('loads CVs for provided userId', () => {
    render(<CvsContent userId="user-123" />);

    expect(useCvs).toHaveBeenCalledWith('user-123');
  });

  it('maps API CVs to CVs for the table', () => {
    render(<CvsContent />);

    const props = vi.mocked(CvsTable).mock.calls[0][0];

    expect(props.cvs).toEqual([
      {
        id: 'cv-1',
        name: 'Frontend CV',
        education: 'BSU',
        employee: 'nastya@example.com',
        description: 'Frontend developer',
      },
      {
        id: 'cv-2',
        name: 'Backend CV',
        education: '',
        employee: '',
        description: 'Backend developer',
      },
    ]);
  });

  it('passes sorting and admin state to CVs table', () => {
    render(<CvsContent isAdmin />);

    const props = vi.mocked(CvsTable).mock.calls[0][0];

    expect(props.sortBy).toBe('name');
    expect(props.sortDirection).toBe('asc');
    expect(props.onSort).toBe(handleSort);
    expect(props.isAdmin).toBe(true);
  });

  it('passes query state and search to content layout', () => {
    render(<CvsContent />);

    const props = vi.mocked(ContentLayout).mock.calls[0][0];

    expect(props.isLoading).toBe(false);
    expect(props.hasError).toBe(false);
    expect(props.errorMessage).toBe('Failed to load CVs');
    expect(props.onRetry).toBe(handleRefresh);

    expect(props.search).toBe('frontend');
    expect(props.onSearchChange).toBe(setSearch);
  });

  it('passes pagination to content layout', () => {
    render(<CvsContent />);

    const props = vi.mocked(ContentLayout).mock.calls[0][0];

    expect(props.pagination).toEqual({
      currentPage: 2,
      totalPages: 3,
      pageSize: 10,
      onPageChange: setCurrentPage,
      onPageSizeChange: setPageSize,
    });
  });

  it('uses userId for create modal when it is provided', () => {
    render(<CvsContent userId="target-user" currentUserId="current-user" />);

    const props = vi.mocked(CreateCvModal).mock.calls[0][0];

    expect(props.userId).toBe('target-user');
  });

  it('uses currentUserId for create modal when userId is missing', () => {
    render(<CvsContent currentUserId="current-user" />);

    const props = vi.mocked(CreateCvModal).mock.calls[0][0];

    expect(props.userId).toBe('current-user');
  });

  it('refreshes CVs after successful creation', () => {
    render(<CvsContent />);

    const props = vi.mocked(CreateCvModal).mock.calls[0][0];

    props.onSuccess?.();

    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('passes refresh handler to CVs table', async () => {
    render(<CvsContent />);

    const props = vi.mocked(CvsTable).mock.calls[0][0];

    await props.onRefresh?.();

    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
});
