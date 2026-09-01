import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentLayout } from '@/components/common/ContentLayout';
import { useCvProjects } from '@/features/cvs/components/projects/hooks/useCvProjects';
import { AddCvProjectModal } from '@/features/cvs/components/projects/modals/AddCvProjectModal';

import { CvProjectsContent } from './CvProjectsContent';
import { CvProjectsTable } from './CvProjectsTable';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/features/cvs/components/projects/hooks/useCvProjects', () => ({
  useCvProjects: vi.fn(),
}));

vi.mock('@/components/common/ContentLayout', () => ({
  ContentLayout: vi.fn(({ children, actionTrigger }) => (
    <div>
      {actionTrigger}
      {children}
    </div>
  )),
}));

vi.mock('./CvProjectsTable', () => ({
  CvProjectsTable: vi.fn(() => <div>CV projects table</div>),
}));

vi.mock('@/features/cvs/components/projects/modals/AddCvProjectModal', () => ({
  AddCvProjectModal: vi.fn(({ trigger }) => <div>{trigger}</div>),
}));

describe('CvProjectsContent', () => {
  const t = vi.fn();

  const setSearch = vi.fn();
  const handleSort = vi.fn();
  const setCurrentPage = vi.fn();
  const setPageSize = vi.fn();
  const handleRefresh = vi.fn();

  const rawProjects = [
    {
      id: 'project-1',
      name: 'Custom CV Project',
      domain: 'HR',
      responsibilities: ['Frontend development'],
      start_date: '2024-01-01',
      end_date: '2025-01-01',
      description: 'Custom description',
      environment: ['React', 'TypeScript'],
      roles: ['Frontend Developer'],
      project: {
        name: 'Original Project',
        domain: 'Original Domain',
        start_date: '2020-01-01',
        end_date: '2021-01-01',
        description: 'Original description',
        environment: ['Java'],
      },
    },
    {
      id: 'project-2',
      name: '',
      domain: '',
      responsibilities: null,
      start_date: '',
      end_date: '',
      description: '',
      environment: null,
      roles: null,
      project: {
        name: 'Fallback Project',
        domain: 'Finance',
        start_date: '2023-01-01',
        end_date: null,
        description: 'Fallback description',
        environment: ['Next.js'],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    handleRefresh.mockResolvedValue([]);

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );

    vi.mocked(useCvProjects).mockReturnValue({
      allItems: [],
      paginatedItems: rawProjects,
      loading: false,
      error: false,
      search: 'react',
      setSearch,
      sortBy: 'name',
      sortDirection: 'asc',
      handleSort,
      currentPage: 2,
      totalPages: 4,
      pageSize: 10,
      setCurrentPage,
      setPageSize,
      handleRefresh,
    } as never);
  });

  it('loads projects for provided CV', () => {
    render(<CvProjectsContent cvId="cv-123" />);

    expect(useCvProjects).toHaveBeenCalledWith('cv-123');
  });

  it('maps raw CV projects to projects for the table', () => {
    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(CvProjectsTable).mock.calls[0][0];

    expect(props.projects).toEqual([
      {
        id: 'project-1',
        name: 'Custom CV Project',
        domain: 'HR',
        responsibilities: ['Frontend development'],
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        description: 'Custom description',
        environment: ['React', 'TypeScript'],
        roles: ['Frontend Developer'],
      },
      {
        id: 'project-2',
        name: 'Fallback Project',
        domain: 'Finance',
        responsibilities: [],
        startDate: '2023-01-01',
        endDate: null,
        description: 'Fallback description',
        environment: ['Next.js'],
        roles: [],
      },
    ]);
  });

  it('passes raw projects and sorting state to table', () => {
    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(CvProjectsTable).mock.calls[0][0];

    expect(props.cvId).toBe('cv-123');
    expect(props.rawProjects).toBe(rawProjects);

    expect(props.sortBy).toBe('name');
    expect(props.sortDirection).toBe('asc');
    expect(props.onSort).toBe(handleSort);
  });

  it('marks search query as active when search contains text', () => {
    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(CvProjectsTable).mock.calls[0][0];

    expect(props.hasSearchQuery).toBe(true);
  });

  it('marks search query as inactive when search contains only spaces', () => {
    vi.mocked(useCvProjects).mockReturnValue({
      allItems: [],
      paginatedItems: rawProjects,
      loading: false,
      error: false,
      search: '   ',
      setSearch,
      sortBy: 'name',
      sortDirection: 'asc',
      handleSort,
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
      setCurrentPage,
      setPageSize,
      handleRefresh,
    } as never);

    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(CvProjectsTable).mock.calls[0][0];

    expect(props.hasSearchQuery).toBe(false);
  });

  it('passes query state and search to content layout', () => {
    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(ContentLayout).mock.calls[0][0];

    expect(props.isLoading).toBe(false);
    expect(props.hasError).toBe(false);

    expect(props.errorMessage).toBe('Failed to load projects');
    expect(props.onRetry).toBe(handleRefresh);

    expect(props.search).toBe('react');
    expect(props.onSearchChange).toBe(setSearch);
  });

  it('passes pagination to content layout', () => {
    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(ContentLayout).mock.calls[0][0];

    expect(props.pagination).toEqual({
      currentPage: 2,
      totalPages: 4,
      pageSize: 10,
      onPageChange: setCurrentPage,
      onPageSizeChange: setPageSize,
    });
  });

  it('passes CV id to add project modal and refreshes after success', () => {
    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(AddCvProjectModal).mock.calls[0][0];

    expect(props.cvId).toBe('cv-123');

    props.onSuccess?.();

    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes projects through table refetch handler', async () => {
    render(<CvProjectsContent cvId="cv-123" />);

    const props = vi.mocked(CvProjectsTable).mock.calls[0][0];

    await props.onRefetch?.();

    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
});
