import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentLayout } from '@/components/common/ContentLayout';
import { useProjects } from '@/features/projects/hooks/useProjects';

import { CreateProjectModal } from './modals/CreateProjectModal';
import { ProjectsContent } from './ProjectsContent';
import { ProjectsTable } from './ProjectsTable';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/features/projects/hooks/useProjects', () => ({
  useProjects: vi.fn(),
}));

vi.mock('@/components/common/ContentLayout', () => ({
  ContentLayout: vi.fn(({ children, actionTrigger }) => (
    <div>
      {actionTrigger}
      {children}
    </div>
  )),
}));

vi.mock('./ProjectsTable', () => ({
  ProjectsTable: vi.fn(() => <div>Projects table</div>),
}));

vi.mock('./modals/CreateProjectModal', () => ({
  CreateProjectModal: vi.fn(({ trigger }) => <div>{trigger}</div>),
}));

describe('ProjectsContent', () => {
  const t = vi.fn();

  const setSearch = vi.fn();
  const handleSort = vi.fn();
  const setCurrentPage = vi.fn();
  const setPageSize = vi.fn();
  const handleRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );

    vi.mocked(useProjects).mockReturnValue({
      allItems: [],
      paginatedItems: [
        {
          id: '1',
          name: 'CV Builder',
          domain: 'HR',
          start_date: '2024-01-01',
          end_date: '2025-01-01',
          description: 'CV application',
          environment: ['React', 'TypeScript'],
        },
        {
          id: '2',
          name: 'Active Project',
          domain: 'Finance',
          start_date: '2025-01-01',
          end_date: null,
          description: 'Active application',
          environment: ['Next.js'],
        },
      ],
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

  it('maps API projects to projects for the table', () => {
    render(<ProjectsContent />);

    const props = vi.mocked(ProjectsTable).mock.calls[0][0];

    expect(props.projects).toEqual([
      {
        id: '1',
        name: 'CV Builder',
        domain: 'HR',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        description: 'CV application',
        environmentSkills: ['React', 'TypeScript'],
      },
      {
        id: '2',
        name: 'Active Project',
        domain: 'Finance',
        startDate: '2025-01-01',
        endDate: 'Present',
        description: 'Active application',
        environmentSkills: ['Next.js'],
      },
    ]);
  });

  it('passes sorting state and handler to projects table', () => {
    render(<ProjectsContent />);

    const props = vi.mocked(ProjectsTable).mock.calls[0][0];

    expect(props.sortBy).toBe('name');
    expect(props.sortDirection).toBe('asc');
    expect(props.onSort).toBe(handleSort);
  });

  it('passes query state and search to content layout', () => {
    render(<ProjectsContent />);

    const props = vi.mocked(ContentLayout).mock.calls[0][0];

    expect(props.isLoading).toBe(false);
    expect(props.hasError).toBe(false);

    expect(props.errorMessage).toBe('Failed to load projects');
    expect(props.onRetry).toBe(handleRefresh);

    expect(props.search).toBe('react');
    expect(props.onSearchChange).toBe(setSearch);
  });

  it('passes pagination configuration to content layout', () => {
    render(<ProjectsContent />);

    const props = vi.mocked(ContentLayout).mock.calls[0][0];

    expect(props.pagination).toEqual({
      currentPage: 2,
      totalPages: 4,
      pageSize: 10,
      onPageChange: setCurrentPage,
      onPageSizeChange: setPageSize,
    });
  });

  it('refreshes projects after successful project creation', () => {
    render(<ProjectsContent />);

    const props = vi.mocked(CreateProjectModal).mock.calls[0][0];

    props.onSuccess?.();

    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
});
