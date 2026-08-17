'use client';

import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { CV_QUERY } from '@/api/cvs';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { CvDetailsForm } from './CvDetailsForm';

type CvDetailsProps = {
  cvId: string;
  currentUserId: string | null;
  isAdmin: boolean;
};

export function CvDetails({ cvId, currentUserId, isAdmin }: CvDetailsProps) {
  const { t } = useTranslation();

  const { data, loading, error, refetch } = useQuery(CV_QUERY, {
    variables: {
      cvId,
    },
  });

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-sm text-destructive">
          {t('cvs.detailsLoadError', 'Failed to load CV details')}
        </p>
        <Button variant="secondary" type="button" onClick={() => refetch()}>
          {t('retry', 'Retry')}
        </Button>
      </div>
    );
  }

  if (!data?.cv) {
    return (
      <div className="flex flex-col items-center pt-10 text-center">
        <p className="text-sm text-muted-foreground">
          {t('cvs.details.notFound', 'CV not found')}
        </p>
      </div>
    );
  }

  const cv = data.cv;
  const isOwner = currentUserId === cv.user?.id;
  const canEdit = isAdmin || isOwner;

  return (
    <div className="flex flex-col items-center pt-4">
      <CvDetailsForm
        cvId={cv.id}
        name={cv.name ?? ''}
        education={cv.education ?? ''}
        description={cv.description ?? ''}
        canEdit={canEdit}
        onUpdated={refetch}
      />
    </div>
  );
}
