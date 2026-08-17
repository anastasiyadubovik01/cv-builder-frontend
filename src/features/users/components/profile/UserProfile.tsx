'use client';

import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

import { USER_QUERY } from '@/api/users';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

import { ProfileFields } from './ProfileFields';
import { UserAvatar } from './UserAvatar';
import { UserInfo } from './UserInfo';

type UserProfileProps = {
  userId: string;
  canEdit: boolean;
  isOwner: boolean;
};

export function UserProfile({ userId, canEdit, isOwner }: UserProfileProps) {
  const { t, i18n } = useTranslation();

  const { data, loading, error, refetch } = useQuery(USER_QUERY, {
    variables: {
      userId,
    },
  });

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-sm text-foreground">
          {t('users.details.loadError')}
        </p>

        <Button variant="secondary" type="button" onClick={() => refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="flex flex-col items-center pt-10 text-center">
        <p className="text-sm text-muted-foreground">No user data</p>
      </div>
    );
  }

  const user = data.user;
  const canVerifyEmail = isOwner && !user.is_verified;

  const firstName = user.profile.first_name ?? '';
  const lastName = user.profile.last_name ?? '';
  const avatar = user.profile.avatar ?? null;

  const department = user.department?.name ?? '';
  const position = user.position?.name ?? '';

  const memberSince = user.created_at
    ? new Intl.DateTimeFormat(i18n.language, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(Number(user.created_at)))
    : '';

  return (
    <div className="flex flex-col items-center pt-4">
      <UserAvatar
        userId={user.id}
        avatar={avatar}
        firstName={firstName}
        lastName={lastName}
        canEdit={canEdit}
        onUpdated={() => refetch()}
      />

      <div className="mt-8">
        <UserInfo
          firstName={firstName}
          lastName={lastName}
          email={user.email}
          memberSince={memberSince}
        />
      </div>

      <ProfileFields
        userId={user.id}
        firstName={firstName}
        lastName={lastName}
        departmentId={user.department?.id ?? ''}
        department={department}
        positionId={user.position?.id ?? ''}
        position={position}
        role={user.role}
        canEdit={canEdit}
        canVerifyEmail={canVerifyEmail}
        onUpdated={refetch}
      />
    </div>
  );
}
