'use client';

import { useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { CvsIcon } from '@/components/icons/cvs-icon';
import { DepartmentsIcon } from '@/components/icons/departments-icon';
import { EmployeesIcon } from '@/components/icons/employees-icon';
import { LanguagesIcon } from '@/components/icons/languages-icon';
import { PositionsIcon } from '@/components/icons/positions-icon';
import { ProjectsIcon } from '@/components/icons/projects-icon';
import { SkillsIcon } from '@/components/icons/skills-icon';
import { SidebarToggleIcon } from '@/components/icons/sidebar-toggle-icon';
import { cn } from '@/lib/utils';

type NavigationItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type NavigationListProps = {
  items: NavigationItem[];
  pathname: string;
  isCollapsed: boolean;
};

const mainNavigationItems: NavigationItem[] = [
  {
    label: 'Employees',
    href: '/users',
    icon: EmployeesIcon,
  },
  {
    label: 'Skills',
    href: '/skills',
    icon: SkillsIcon,
  },
  {
    label: 'Languages',
    href: '/languages',
    icon: LanguagesIcon,
  },
  {
    label: 'CVs',
    href: '/cvs',
    icon: CvsIcon,
  },
];

const adminNavigationItems: NavigationItem[] = [
  {
    label: 'Departments',
    href: '/departments',
    icon: DepartmentsIcon,
  },
  {
    label: 'Positions',
    href: '/positions',
    icon: PositionsIcon,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: ProjectsIcon,
  },
];

function NavigationList({ items, pathname, isCollapsed }: NavigationListProps) {
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
              <span className="hidden lg:block">{item.label}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex min-h-screen w-14 shrink-0 flex-col bg-background transition-[width] duration-200',
        !isCollapsed && 'lg:w-[200px]',
      )}
    >
      <div className="relative flex h-14 shrink-0 items-center px-4">
        <Image
          src="/logos/logo-light-theme.svg"
          alt=""
          width={24}
          height={24}
          className="dark:hidden"
        />

        <Image
          src="/logos/logo-dark-theme.svg"
          alt=""
          width={24}
          height={24}
          className="hidden dark:block"
        />

        {!isCollapsed && (
          <span className="ml-4 hidden text-base font-medium text-[var(--sidebar-logo-foreground)] lg:block">
            CV Builder
          </span>
        )}

        <button
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute top-1/2 right-[-12px] -translate-y-1/2 text-[var(--sidebar-toggle)]"
        >
          <SidebarToggleIcon
            className={cn(
              'transition-transform duration-200',
              isCollapsed && 'rotate-180',
            )}
          />
        </button>
      </div>

      <nav>
        <NavigationList
          items={mainNavigationItems}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />

        <div className="my-[14px] h-px w-full bg-[var(--sidebar-divider)]" />

        <NavigationList
          items={adminNavigationItems}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />
      </nav>

      <div className="mt-auto flex h-14 shrink-0 items-center px-[10px]">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-base text-primary-foreground">
          R
        </div>

        {!isCollapsed && (
          <span className="ml-2 hidden truncate text-sm text-foreground lg:block">
            Rostislav Harlanov
          </span>
        )}
      </div>
    </aside>
  );
}
