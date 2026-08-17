'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { USER_QUERY } from '@/api/users';
import { UserBreadcrumbIcon } from '@/components/icons/user-breadcrumb-icon';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils';

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
    variables: {
      userId,
    },
  });

  const firstName = data?.user.profile.first_name ?? '';
  const lastName = data?.user.profile.last_name ?? '';

  const fallbackFullName = [firstName, lastName].filter(Boolean).join(' ');

  const userName =
    data?.user.profile.full_name || fallbackFullName || data?.user.email || '';

  const tabs = [
    {
      key: 'profile',
      label: labels.profile,
      href: `/users/${userId}`,
    },
    {
      key: 'skills',
      label: labels.skills,
      href: `/users/${userId}/skills`,
    },
    {
      key: 'languages',
      label: labels.languages,
      href: `/users/${userId}/languages`,
    },
    ...(showCvs
      ? [
          {
            key: 'cvs',
            label: labels.cvs,
            href: `/users/${userId}/cvs`,
          },
        ]
      : []),
  ];

  const activeTab =
    tabs.find((tab) => {
      if (tab.key === 'profile') {
        return pathname === `/users/${userId}`;
      }

      return pathname.startsWith(tab.href);
    }) ?? tabs[0];

  return (
    <>
      <Breadcrumbs
        items={[
          {
            label: labels.employees,
            href: '/users',
          },
          {
            label: userName,
            icon: UserBreadcrumbIcon,
            accent: true,
          },
          {
            label: activeTab.label,
          },
        ]}
      />

      <div className="px-5">
        <nav className="flex h-12">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab.key;

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={cn(
                  'flex h-12 w-[150px] items-center justify-center',
                  'text-[14px] leading-[18px] font-semibold tracking-[0.4px] uppercase',
                  isActive
                    ? 'border-b-2 border-destructive text-destructive'
                    : 'text-foreground',
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
