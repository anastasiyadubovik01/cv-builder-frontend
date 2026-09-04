'use client';

import { useQuery } from '@apollo/client/react';
import { usePathname } from 'next/navigation';
import { CV_QUERY } from '@/api/cvs';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NavTabs, NavTabItem } from '@/components/ui/nav-tabs';

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
    variables: { cvId },
  });

  const cvName = data?.cv?.name || cvId;

  const tabs: NavTabItem[] = [
    {
      key: 'details',
      label: labels.details,
      href: `/cvs/${cvId}`,
      exact: true,
    },
    {
      key: 'skills',
      label: labels.skills,
      href: `/cvs/${cvId}/skills`,
      exact: false,
    },
    {
      key: 'projects',
      label: labels.projects,
      href: `/cvs/${cvId}/projects`,
      exact: false,
    },
    {
      key: 'preview',
      label: labels.preview,
      href: `/cvs/${cvId}/preview`,
      exact: false,
    },
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
              { label: labels.cvs, href: '/cvs' },
              { label: cvName, accent: true },
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
