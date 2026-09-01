import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CV_PREVIEW_QUERY } from '@/api/cv-preview';
import { SKILLS_QUERY } from '@/api/skills';
import { QueryErrorState } from '@/components/common/QueryErrorState';
import { calculateSkillsCategoryMetrics } from '@/features/cvs/utils/calculateSkillsCategoryMetrics';

import { useExportCvPdf } from './hooks/useExportCvPdf';
import { CvPreviewContent } from './CvPreviewContent';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/components/ui/loading-overlay', () => ({
  LoadingOverlay: () => <div>Loading CV preview</div>,
}));

vi.mock('@/components/common/QueryErrorState', () => ({
  QueryErrorState: vi.fn(
    ({ message, onRetry }: { message: string; onRetry?: () => unknown }) => (
      <div>
        <span>{message}</span>

        {onRetry && (
          <button type="button" onClick={() => void onRetry()}>
            Retry
          </button>
        )}
      </div>
    ),
  ),
}));

vi.mock('./hooks/useExportCvPdf', () => ({
  useExportCvPdf: vi.fn(),
}));

vi.mock('@/features/cvs/utils/calculateSkillsCategoryMetrics', () => ({
  calculateSkillsCategoryMetrics: vi.fn(),
}));

describe('CvPreviewContent', () => {
  const t = vi.fn();
  const refetch = vi.fn();
  const handleExport = vi.fn();

  const cv = {
    id: 'cv-1',
    name: 'Frontend CV',
    education: 'BSU',
    description: 'Frontend developer CV',
    user: {
      position: {
        name: 'Frontend Developer',
      },
      profile: {
        full_name: 'Nastya Developer',
        first_name: 'Nastya',
        last_name: 'Developer',
        languages: [
          {
            name: 'English',
            proficiency: 'B1',
          },
        ],
      },
    },
    skills: [
      {
        name: 'React',
        categoryId: 'frontend',
        mastery: 'Advanced',
      },
      {
        name: 'TypeScript',
        categoryId: 'frontend',
        mastery: 'Proficient',
      },
    ],
    projects: [
      {
        id: 'project-1',
        name: 'CV Builder',
        domain: 'HR',
        description: 'CV management system',
        start_date: '2024-01-01',
        end_date: null,
        roles: ['Frontend Developer'],
        responsibilities: ['developed frontend', 'implemented testing'],
        environment: ['React', 'TypeScript'],
      },
      {
        id: 'project-2',
        name: 'Admin Panel',
        domain: 'HR',
        description: 'Administration system',
        start_date: '2023-01-01',
        end_date: '2023-12-01',
        roles: [],
        responsibilities: [],
        environment: [],
      },
    ],
  };

  const skillsData = {
    skills: {
      items: [
        {
          id: 'skill-react',
          name: 'React',
          category: {
            id: 'frontend',
            name: 'Frontend',
            order: 1,
            parent: null,
          },
          category_name: 'Frontend',
          category_parent_name: null,
        },
        {
          id: 'skill-typescript',
          name: 'TypeScript',
          category: {
            id: 'frontend',
            name: 'Frontend',
            order: 1,
            parent: null,
          },
          category_name: 'Frontend',
          category_parent_name: null,
        },
      ],
      total: 2,
      page: 1,
      limit: 100,
      total_pages: 1,
    },
  };

  const mockQueries = ({
    cvValue = cv,
    cvLoading = false,
    cvError = undefined,
    skillsValue = skillsData,
  }: {
    cvValue?: typeof cv | null;
    cvLoading?: boolean;
    cvError?: unknown;
    skillsValue?: typeof skillsData;
  } = {}) => {
    vi.mocked(useQuery).mockImplementation((query) => {
      if (query === CV_PREVIEW_QUERY) {
        return {
          data: cvValue ? { cv: cvValue } : undefined,
          loading: cvLoading,
          error: cvError,
          refetch,
        } as never;
      }

      if (query === SKILLS_QUERY) {
        return {
          data: skillsValue,
          loading: false,
          error: undefined,
        } as never;
      }

      return {} as never;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );

    vi.mocked(useExportCvPdf).mockReturnValue({
      containerRef: { current: null },
      handleExport,
      loading: false,
    } as never);

    vi.mocked(calculateSkillsCategoryMetrics).mockImplementation(
      (categoryName, skills) => ({
        categoryName,
        skills,
        experienceYears: 2,
        lastUsed: '2026',
      }),
    );

    mockQueries();
  });

  it('requests CV preview and skills with correct variables', () => {
    render(<CvPreviewContent cvId="cv-123" />);

    expect(useQuery).toHaveBeenNthCalledWith(1, CV_PREVIEW_QUERY, {
      variables: {
        cvId: 'cv-123',
      },
      fetchPolicy: 'cache-and-network',
    });

    expect(useQuery).toHaveBeenNthCalledWith(2, SKILLS_QUERY, {
      variables: {
        params: {
          page: 1,
          limit: 100,
        },
      },
    });
  });

  it('shows loading state while CV is loading', () => {
    mockQueries({
      cvLoading: true,
    });

    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('Loading CV preview')).toBeInTheDocument();
  });

  it('shows error state and retries CV query', async () => {
    const user = userEvent.setup();

    mockQueries({
      cvError: new Error('Failed'),
    });

    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('Failed to load CV preview')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Retry',
      }),
    );

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows error state when CV data is missing', () => {
    mockQueries({
      cvValue: null,
    });

    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('Failed to load CV preview')).toBeInTheDocument();
  });

  it('shows unavailable state when required CV data is missing', () => {
    const incompleteCv = {
      ...cv,
      projects: [],
    };

    mockQueries({
      cvValue: incompleteCv,
    });

    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('CV preview is not available')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Export PDF',
      }),
    ).toBeDisabled();

    expect(useExportCvPdf).toHaveBeenCalledWith('cv-preview');
  });

  it('uses CV name as PDF filename when required data exists', () => {
    render(<CvPreviewContent cvId="cv-123" />);

    expect(useExportCvPdf).toHaveBeenCalledWith('Frontend CV');
  });

  it('renders main CV information', () => {
    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('Nastya Developer')).toBeInTheDocument();

    const header = screen.getByRole('banner');

    expect(within(header).getByText('Frontend Developer')).toBeInTheDocument();

    expect(screen.getByText('Frontend CV')).toBeInTheDocument();

    expect(screen.getByText('Frontend developer CV')).toBeInTheDocument();

    expect(screen.getByText('BSU')).toBeInTheDocument();

    expect(screen.getByText('English — B1')).toBeInTheDocument();
  });

  it('renders unique project domains', () => {
    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('Domains')).toBeInTheDocument();

    expect(screen.getByText('HR')).toBeInTheDocument();
  });

  it('groups skills by category and calculates category metrics', () => {
    render(<CvPreviewContent cvId="cv-123" />);

    expect(calculateSkillsCategoryMetrics).toHaveBeenCalledWith(
      'Frontend',
      ['React', 'TypeScript'],
      cv.projects,
    );

    expect(screen.getAllByText('Frontend').length).toBeGreaterThan(0);

    expect(screen.getAllByText(/React/).length).toBeGreaterThan(0);

    expect(screen.getByText('2')).toBeInTheDocument();

    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('renders project information and formatted period', () => {
    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('CV Builder')).toBeInTheDocument();

    expect(screen.getByText('CV management system')).toBeInTheDocument();

    expect(screen.getByText('01.2024 - Present')).toBeInTheDocument();

    const projectsHeading = screen.getByRole('heading', {
      name: 'Projects',
    });

    const projectsSection = projectsHeading.closest('section');

    expect(projectsSection).not.toBeNull();

    expect(
      within(projectsSection!).getByText('Frontend Developer'),
    ).toBeInTheDocument();

    expect(
      within(projectsSection!).getByText('React, TypeScript'),
    ).toBeInTheDocument();
  });

  it('capitalizes project responsibilities', () => {
    render(<CvPreviewContent cvId="cv-123" />);

    expect(screen.getByText('Developed frontend')).toBeInTheDocument();

    expect(screen.getByText('Implemented testing')).toBeInTheDocument();
  });

  it('exports CV after clicking Export PDF', async () => {
    const user = userEvent.setup();

    render(<CvPreviewContent cvId="cv-123" />);

    await user.click(
      screen.getByRole('button', {
        name: 'Export PDF',
      }),
    );

    expect(handleExport).toHaveBeenCalledTimes(1);
  });

  it('disables export button while PDF is being generated', () => {
    vi.mocked(useExportCvPdf).mockReturnValue({
      containerRef: { current: null },
      handleExport,
      loading: true,
    } as never);

    render(<CvPreviewContent cvId="cv-123" />);

    expect(
      screen.getByRole('button', {
        name: 'Export PDF',
      }),
    ).toBeDisabled();
  });

  it('passes error message and retry handler to error state', () => {
    mockQueries({
      cvError: new Error('Failed'),
    });

    render(<CvPreviewContent cvId="cv-123" />);

    const props = vi.mocked(QueryErrorState).mock.calls[0][0];

    expect(props.message).toBe('Failed to load CV preview');

    expect(props.onRetry).toBe(refetch);
  });
});
