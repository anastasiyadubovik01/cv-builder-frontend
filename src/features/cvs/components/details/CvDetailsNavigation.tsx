'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CV_QUERY } from '@/api/cvs';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { cn } from '@/lib/utils';

type CvDetailsNavigationProps = {
  cvId: string;
  labels: {
    cvs: string;
    details: string;
    skills: string;
    projects: string;
    preview: string;
  };
};

export function CvDetailsNavigation({
  cvId,
  labels,
}: CvDetailsNavigationProps) {
  const pathname = usePathname();

  const { data } = useQuery(CV_QUERY, {
    variables: {
      cvId,
    },
  });

  const cvName = data?.cv?.name || cvId;

  const tabs = [
    {
      key: 'details',
      label: labels.details,
      href: `/cvs/${cvId}`,
    },
    {
      key: 'skills',
      label: labels.skills,
      href: `/cvs/${cvId}/skills`,
    },
    {
      key: 'projects',
      label: labels.projects,
      href: `/cvs/${cvId}/projects`,
    },
    {
      key: 'preview',
      label: labels.preview,
      href: `/cvs/${cvId}/preview`,
    },
  ];

  const activeTab =
    tabs.find((tab) => {
      if (tab.key === 'details') {
        return pathname === `/cvs/${cvId}`;
      }
      return pathname.startsWith(tab.href);
    }) ?? tabs[0];

  return (
    <>
      <Breadcrumbs
        items={[
          {
            label: labels.cvs,
            href: '/cvs',
          },
          {
            label: cvName,
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
