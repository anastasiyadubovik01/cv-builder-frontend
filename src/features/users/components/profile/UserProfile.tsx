'use client';

import { UserAvatar } from './UserAvatar';
import { UserInfo } from './UserInfo';
import { ProfileFields } from './ProfileFields';

const user = {
  firstName: 'Rostislav',
  lastName: 'Harlanov',
  email: 'thorn_pear@icloud.com',
  avatar: null,
  memberSince: 'Sun Jan 14 2024',
  department: 'React',
  position: 'Software Engineer',
};

export function UserProfile() {
  return (
    <div className="flex flex-col items-center pt-4">
      <UserAvatar
        avatar={user.avatar}
        firstName={user.firstName}
        lastName={user.lastName}
      />

      <div className="mt-8">
        <UserInfo
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          memberSince={user.memberSince}
        />

        <ProfileFields
          firstName={user.firstName}
          lastName={user.lastName}
          department={user.department}
          position={user.position}
          canEdit={false}
        />
      </div>
    </div>
  );
}
