import { render, screen } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CV_QUERY } from '@/api/cvs';

import { CvDetails } from './CvDetails';

vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/loading-overlay', () => ({
  LoadingOverlay: () => <div data-testid="loading-overlay">Loading</div>,
}));

vi.mock('@/components/common/QueryErrorState', () => ({
  QueryErrorState: ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry?: () => void;
  }) => (
    <div>
      <span>{message}</span>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

vi.mock('./CvDetailsForm', () => ({
  CvDetailsForm: ({
    cvId,
    name,
    education,
    description,
    canEdit,
    onUpdated,
  }: {
    cvId: string;
    name: string;
    education: string;
    description: string;
    canEdit: boolean;
    onUpdated: () => void;
  }) => (
    <div
      data-testid="cv-details-form"
      data-cv-id={cvId}
      data-name={name}
      data-education={education}
      data-description={description}
      data-can-edit={String(canEdit)}
    >
      <button onClick={onUpdated}>Update</button>
    </div>
  ),
}));

describe('CvDetails', () => {
  const refetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useQuery).mockReturnValue({
      data: {
        cv: {
          id: 'cv-1',
          name: 'Frontend CV',
          education: 'BSU',
          description: 'Frontend Developer',
          user: {
            id: 'user-1',
          },
        },
      },
      loading: false,
      error: undefined,
      refetch,
    } as never);
  });

  it('loads CV by id', () => {
    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    expect(useQuery).toHaveBeenCalledWith(CV_QUERY, {
      variables: {
        cvId: 'cv-1',
      },
    });
  });

  it('shows loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch,
    } as never);

    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();

    expect(screen.queryByTestId('cv-details-form')).not.toBeInTheDocument();
  });

  it('shows error state and retries query', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Failed'),
      refetch,
    } as never);

    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    expect(screen.getByText('cvs.detailsLoadError')).toBeInTheDocument();

    screen.getByRole('button', { name: 'Retry' }).click();

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows not found state when CV is missing', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        cv: null,
      },
      loading: false,
      error: undefined,
      refetch,
    } as never);

    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    expect(screen.getByText('cvs.notFound')).toBeInTheDocument();

    expect(screen.queryByTestId('cv-details-form')).not.toBeInTheDocument();
  });

  it('allows owner to edit CV', () => {
    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    expect(screen.getByTestId('cv-details-form')).toHaveAttribute(
      'data-can-edit',
      'true',
    );
  });

  it('allows admin to edit another user CV', () => {
    render(<CvDetails cvId="cv-1" currentUserId="user-2" isAdmin />);

    expect(screen.getByTestId('cv-details-form')).toHaveAttribute(
      'data-can-edit',
      'true',
    );
  });

  it('does not allow another user to edit CV', () => {
    render(<CvDetails cvId="cv-1" currentUserId="user-2" isAdmin={false} />);

    expect(screen.getByTestId('cv-details-form')).toHaveAttribute(
      'data-can-edit',
      'false',
    );
  });

  it('passes CV data to form', () => {
    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    const form = screen.getByTestId('cv-details-form');

    expect(form).toHaveAttribute('data-cv-id', 'cv-1');
    expect(form).toHaveAttribute('data-name', 'Frontend CV');
    expect(form).toHaveAttribute('data-education', 'BSU');
    expect(form).toHaveAttribute('data-description', 'Frontend Developer');
  });

  it('uses empty strings for missing CV fields', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        cv: {
          id: 'cv-1',
          name: null,
          education: null,
          description: null,
          user: {
            id: 'user-1',
          },
        },
      },
      loading: false,
      error: undefined,
      refetch,
    } as never);

    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    const form = screen.getByTestId('cv-details-form');

    expect(form).toHaveAttribute('data-name', '');
    expect(form).toHaveAttribute('data-education', '');
    expect(form).toHaveAttribute('data-description', '');
  });

  it('refetches CV after form update', () => {
    render(<CvDetails cvId="cv-1" currentUserId="user-1" isAdmin={false} />);

    screen.getByRole('button', { name: 'Update' }).click();

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
