import { render } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CV_QUERY } from '@/api/cvs';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NavTabs } from '@/components/ui/nav-tabs';

import { CvDetailsNavigation } from './CvDetailsNavigation';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('@/components/layout/Breadcrumbs', () => ({
  Breadcrumbs: vi.fn(() => <div data-testid="breadcrumbs" />),
}));

vi.mock('@/components/ui/nav-tabs', () => ({
  NavTabs: vi.fn(() => <div data-testid="nav-tabs" />),
}));

describe('CvDetailsNavigation', () => {
  const labels = {
    cvs: 'CVs',
    details: 'Details',
    skills: 'Skills',
    projects: 'Projects',
    preview: 'Preview',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePathname).mockReturnValue('/cvs/cv-1');

    vi.mocked(useQuery).mockReturnValue({
      data: {
        cv: {
          id: 'cv-1',
          name: 'Frontend CV',
        },
      },
    } as never);
  });

  it('loads CV by id', () => {
    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    expect(useQuery).toHaveBeenCalledWith(CV_QUERY, {
      variables: {
        cvId: 'cv-1',
      },
    });
  });

  it('creates navigation tabs', () => {
    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    const props = vi.mocked(NavTabs).mock.calls[0][0];

    expect(props.items).toEqual([
      {
        key: 'details',
        label: 'Details',
        href: '/cvs/cv-1',
        exact: true,
      },
      {
        key: 'skills',
        label: 'Skills',
        href: '/cvs/cv-1/skills',
        exact: false,
      },
      {
        key: 'projects',
        label: 'Projects',
        href: '/cvs/cv-1/projects',
        exact: false,
      },
      {
        key: 'preview',
        label: 'Preview',
        href: '/cvs/cv-1/preview',
        exact: false,
      },
    ]);
  });

  it('shows CV name in breadcrumbs', () => {
    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    const props = vi.mocked(Breadcrumbs).mock.calls[0][0];

    expect(props.items).toEqual([
      {
        label: 'CVs',
        href: '/cvs',
      },
      {
        label: 'Frontend CV',
        accent: true,
      },
      {
        label: 'Details',
      },
    ]);
  });

  it('uses cvId when CV name is missing', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        cv: {
          id: 'cv-1',
          name: '',
        },
      },
    } as never);

    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    const props = vi.mocked(Breadcrumbs).mock.calls[0][0];

    expect(props.items[1]).toEqual({
      label: 'cv-1',
      accent: true,
    });
  });

  it('uses skills as active tab on skills route', () => {
    vi.mocked(usePathname).mockReturnValue('/cvs/cv-1/skills');

    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    const props = vi.mocked(Breadcrumbs).mock.calls[0][0];

    expect(props.items[2]).toEqual({
      label: 'Skills',
    });
  });

  it('uses projects as active tab on nested projects route', () => {
    vi.mocked(usePathname).mockReturnValue('/cvs/cv-1/projects/project-1');

    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    const props = vi.mocked(Breadcrumbs).mock.calls[0][0];

    expect(props.items[2]).toEqual({
      label: 'Projects',
    });
  });

  it('uses preview as active tab on preview route', () => {
    vi.mocked(usePathname).mockReturnValue('/cvs/cv-1/preview');

    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    const props = vi.mocked(Breadcrumbs).mock.calls[0][0];

    expect(props.items[2]).toEqual({
      label: 'Preview',
    });
  });

  it('falls back to details for unknown route', () => {
    vi.mocked(usePathname).mockReturnValue('/cvs/cv-1/unknown');

    render(<CvDetailsNavigation cvId="cv-1" labels={labels} />);

    const props = vi.mocked(Breadcrumbs).mock.calls[0][0];

    expect(props.items[2]).toEqual({
      label: 'Details',
    });
  });
});
