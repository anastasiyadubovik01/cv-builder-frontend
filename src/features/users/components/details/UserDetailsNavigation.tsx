'use client';

import { useQuery } from '@apollo/client/react';
import { usePathname } from 'next/navigation';
import { USER_QUERY } from '@/api/users';
import { UserBreadcrumbIcon } from '@/components/icons/user-breadcrumb-icon';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NavTabs, NavTabItem } from '@/components/ui/nav-tabs';

type UserDetailsNavigationProps = {
  userId: string;
  labels: {
    employees: string;
    profile: string;
    skills: string;
    languages: string;
    cvs: string;
  };
  showCvs?: boolean;
};

export function UserDetailsNavigation({
  userId,
  labels,
  showCvs = false,
}: UserDetailsNavigationProps) {
  const pathname = usePathname();

  const { data } = useQuery(USER_QUERY, {
    variables: { userId },
  });

  const firstName = data?.user.profile.first_name ?? '';
  const lastName = data?.user.profile.last_name ?? '';
  const fallbackFullName = [firstName, lastName].filter(Boolean).join(' ');
  const userName =
    data?.user.profile.full_name || fallbackFullName || data?.user.email || '';

  const tabs: NavTabItem[] = [
    {
      key: 'profile',
      label: labels.profile,
      href: `/users/${userId}`,
      exact: true,
    },
    {
      key: 'skills',
      label: labels.skills,
      href: `/users/${userId}/skills`,
      exact: false,
    },
    {
      key: 'languages',
      label: labels.languages,
      href: `/users/${userId}/languages`,
      exact: false,
    },
    ...(showCvs
      ? [
          {
            key: 'cvs',
            label: labels.cvs,
            href: `/users/${userId}/cvs`,
            exact: false,
          },
        ]
      : []),
  ];

  const activeTab =
    tabs.find((tab) =>
      tab.exact ? pathname === tab.href : pathname.startsWith(tab.href),
    ) ?? tabs[0];

  return (
    <>
      <div className="sticky top-0 z-30 w-full px-6">
        <div className="bg-background">
          <Breadcrumbs
            items={[
              { label: labels.employees, href: '/users' },
              { label: userName, icon: UserBreadcrumbIcon, accent: true },
              { label: activeTab.label },
            ]}
          />
        </div>
      </div>

      <div className="px-5">
        <NavTabs items={tabs} />
      </div>
    </>
  );
}
