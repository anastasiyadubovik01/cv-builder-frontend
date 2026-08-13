'use client';

import { useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useQuery } from '@apollo/client/react';
import { useT } from 'next-i18next/client';

import { ME_QUERY } from '@/api/profile';
import { Button } from '@/components/ui/button';

import { CvsIcon } from '@/components/icons/cvs-icon';
import { DepartmentsIcon } from '@/components/icons/departments-icon';
import { EmployeesIcon } from '@/components/icons/employees-icon';
import { LanguagesIcon } from '@/components/icons/languages-icon';
import { PositionsIcon } from '@/components/icons/positions-icon';
import { ProjectsIcon } from '@/components/icons/projects-icon';
import { SkillsIcon } from '@/components/icons/skills-icon';
import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { cn } from '@/lib/utils';

type NavigationItem = {
  labelKey: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavigationListProps = {
  items: NavigationItem[];
  pathname: string;
  isCollapsed: boolean;
};

type SidebarProps = {
  role: string | null;
};

const mainNavigationItems: NavigationItem[] = [
  {
    labelKey: 'sidebar.employees',
    href: '/users',
    icon: EmployeesIcon,
  },
  {
    labelKey: 'sidebar.skills',
    href: '/skills',
    icon: SkillsIcon,
  },
  {
    labelKey: 'sidebar.languages',
    href: '/languages',
    icon: LanguagesIcon,
  },
  {
    labelKey: 'sidebar.cvs',
    href: '/cvs',
    icon: CvsIcon,
  },
];

const adminNavigationItems: NavigationItem[] = [
  {
    labelKey: 'sidebar.departments',
    href: '/departments',
    icon: DepartmentsIcon,
  },
  {
    labelKey: 'sidebar.positions',
    href: '/positions',
    icon: PositionsIcon,
  },
  {
    labelKey: 'sidebar.projects',
    href: '/projects',
    icon: ProjectsIcon,
  },
];

function NavigationList({ items, pathname, isCollapsed }: NavigationListProps) {
  const { t } = useT('common');

  return (
    <div className="flex flex-col gap-[14px]">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex h-14 items-center gap-4 px-4 text-base text-[var(--sidebar-foreground)] transition-colors',
              isActive &&
                'rounded-r-full bg-[var(--sidebar-active-background)] text-[var(--sidebar-active-foreground)]',
            )}
          >
            <Icon className="size-6 shrink-0" />

            {!isCollapsed && (
              <span className="hidden lg:block">{t(item.labelKey)}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useT('common');

  const { data } = useQuery(ME_QUERY);

  const currentUser = data?.me;

  const userName =
    currentUser?.full_name ||
    [currentUser?.first_name, currentUser?.last_name]
      .filter(Boolean)
      .join(' ') ||
    currentUser?.email ||
    '';

  const initials =
    [currentUser?.first_name, currentUser?.last_name]
      .filter(Boolean)
      .map((name) => name?.[0])
      .join('')
      .toUpperCase() ||
    currentUser?.email?.[0]?.toUpperCase() ||
    '';

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen w-14 shrink-0 flex-col bg-background transition-[width] duration-200',
        !isCollapsed && 'lg:w-[200px]',
      )}
    >
      <div className="flex h-14 shrink-0 items-center px-4">
        <Image
          src="/logos/logo-light-theme.svg"
          alt="CV Builder"
          width={24}
          height={24}
          className="dark:hidden"
        />

        <Image
          src="/logos/logo-dark-theme.svg"
          alt="CV Builder"
          width={24}
          height={24}
          className="hidden dark:block"
        />

        {!isCollapsed && (
          <span className="ml-4 hidden whitespace-nowrap text-base font-medium text-[var(--sidebar-logo-foreground)] lg:block">
            CV Builder
          </span>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-14 right-[-20px] z-10 -translate-y-1/2 rounded-none border-0 bg-transparent p-0 text-[var(--sidebar-toggle)] shadow-none hover:bg-transparent active:bg-transparent"
      >
        <ChevronLeftIcon
          className={cn(
            'size-6 transition-transform duration-200',
            isCollapsed && 'rotate-180',
          )}
        />
      </Button>

      <nav className="pt-[14px]">
        <NavigationList
          items={mainNavigationItems}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        {role === 'Admin' && (
          <>
            <div className="my-[14px] h-px w-full bg-[var(--sidebar-divider)]" />

            <NavigationList
              items={adminNavigationItems}
              pathname={pathname}
              isCollapsed={isCollapsed}
            />
          </>
        )}
      </nav>

      {currentUser && (
        <div className="mt-auto mb-14 flex h-14 shrink-0 items-center pl-[10px]">
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={currentUser.avatar ?? undefined}
              alt={userName || 'User avatar'}
            />

            <AvatarFallback className="bg-primary text-xl text-background">
              {initials}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <span className="ml-2 hidden truncate text-base text-foreground lg:block">
              {userName}
            </span>
          )}
        </div>
      )}
    </aside>
  );
}
