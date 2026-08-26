'use client';

import { useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useApolloClient } from '@apollo/client/react';

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
import { ProfileIcon } from '@/components/icons/profile-icon';
import { SettingsIcon } from '@/components/icons/settings-icon';
import { LogoutIcon } from '@/components/icons/logout-icon';
import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { logoutAction } from '@/app/actions/auth';

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
  isTabletOpen: boolean;
  onNavigate: () => void;
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

function NavigationList({
  items,
  pathname,
  isCollapsed,
  isTabletOpen,
  onNavigate,
}: NavigationListProps) {
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
            onClick={onNavigate}
            className={cn(
              'flex h-14 items-center gap-4 px-4 text-base text-[var(--sidebar-foreground)] transition-colors',
              isActive &&
                'rounded-r-full bg-[var(--sidebar-active-background)] text-[var(--sidebar-active-foreground)]',
            )}
          >
            <Icon className="size-6 shrink-0" />

            <span
              className={cn(
                'whitespace-nowrap',
                !isTabletOpen && 'max-lg:hidden',
                isCollapsed && 'lg:hidden',
              )}
            >
              {t(item.labelKey)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const router = useRouter();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [isTabletOpen, setIsTabletOpen] = useState(false);

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

  const client = useApolloClient();

  const handleLogout = async () => {
    setProfileMenuOpen(false);

    await logoutAction();
    await client.clearStore();

    router.push('/sign-in');
    router.refresh();
  };

  return (
    <>
      {isTabletOpen && (
        <button
          type="button"
          aria-label={t('sidebar.collapse')}
          onClick={() => setIsTabletOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <div
        className={cn(
          'relative z-50 h-screen w-14 shrink-0 transition-[width] duration-200',
          isCollapsed ? 'lg:w-14' : 'lg:w-[200px]',
        )}
      >
        <aside
          className={cn(
            'sticky top-0 z-50 flex h-screen flex-col bg-background transition-[width] duration-200',
            isTabletOpen ? 'w-[200px]' : 'w-14',
            isCollapsed ? 'lg:w-14' : 'lg:w-[200px]',
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

            <span
              className={cn(
                'ml-4 whitespace-nowrap text-base font-medium text-[var(--sidebar-logo-foreground)]',
                !isTabletOpen && 'max-lg:hidden',
                isCollapsed && 'lg:hidden',
              )}
            >
              CV Builder
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              isTabletOpen ? t('sidebar.collapse') : t('sidebar.expand')
            }
            aria-expanded={isTabletOpen}
            onClick={() => setIsTabletOpen((prev) => !prev)}
            className="absolute top-[51px] -right-3 z-[60] size-6 rounded-[20px] border-0 bg-[#F5F5F7] p-0 text-[#626262] shadow-none hover:bg-[#F5F5F7] active:bg-[#F5F5F7] dark:bg-[#454545] dark:text-[#AEAEAE] dark:hover:bg-[#454545] dark:active:bg-[#454545] lg:hidden"
          >
            <ChevronLeftIcon
              className={cn(
                'size-6 transition-transform duration-200',
                !isTabletOpen && 'rotate-180',
              )}
            />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')
            }
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="absolute top-14 right-[-20px] z-10 hidden -translate-y-1/2 rounded-none border-0 bg-transparent p-0 text-[var(--sidebar-toggle)] shadow-none hover:bg-transparent active:bg-transparent lg:inline-flex"
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
              isTabletOpen={isTabletOpen}
              onNavigate={() => setIsTabletOpen(false)}
            />

            {role === 'Admin' && (
              <>
                <div className="my-[14px] h-px w-full bg-[var(--sidebar-divider)]" />

                <NavigationList
                  items={adminNavigationItems}
                  pathname={pathname}
                  isCollapsed={isCollapsed}
                  isTabletOpen={isTabletOpen}
                  onNavigate={() => setIsTabletOpen(false)}
                />
              </>
            )}
          </nav>

          <div className="mt-auto mb-14 h-14 shrink-0">
            {currentUser && (
              <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                <PopoverTrigger className="flex h-14 w-full cursor-pointer items-center pl-[10px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={currentUser.avatar ?? undefined}
                      alt={userName || 'User avatar'}
                    />

                    <AvatarFallback className="bg-primary text-xl text-background">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className={cn(
                      'ml-2 truncate text-base text-foreground',
                      !isTabletOpen && 'max-lg:hidden',
                      isCollapsed && 'lg:hidden',
                    )}
                  >
                    {userName}
                  </span>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="start"
                  sideOffset={0}
                  className={cn(
                    'w-[200px] gap-0 overflow-hidden rounded-[8px] border border-[#AEAEAE] bg-[#E2E2E4] p-0 text-[#2E2E2E] shadow-none',
                    'dark:border-[#626262] dark:bg-[#454545] dark:text-[#F5F5F7]',
                    'max-lg:-ml-2',
                    !isTabletOpen && 'max-lg:w-14',
                    isCollapsed && 'lg:w-14',
                  )}
                >
                  <Link
                    href={`/users/${currentUser.id}`}
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex h-10 items-center gap-4 px-4 text-base leading-6 hover:bg-black/5 focus-visible:bg-black/5 focus-visible:outline-none dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                  >
                    <ProfileIcon className="size-6 shrink-0" />

                    <span
                      className={cn(
                        !isTabletOpen && 'max-lg:hidden',
                        isCollapsed && 'lg:hidden',
                      )}
                    >
                      {t('sidebar.profile')}
                    </span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex h-10 items-center gap-4 border-b border-[#AEAEAE] px-4 text-base leading-6 hover:bg-black/5 focus-visible:bg-black/5 focus-visible:outline-none dark:border-[#626262] dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                  >
                    <SettingsIcon className="size-6 shrink-0" />

                    <span
                      className={cn(
                        !isTabletOpen && 'max-lg:hidden',
                        isCollapsed && 'lg:hidden',
                      )}
                    >
                      {t('sidebar.settings')}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex h-10 w-full items-center gap-4 px-4 text-left text-base leading-6 hover:bg-black/5 focus-visible:bg-black/5 focus-visible:outline-none dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                  >
                    <LogoutIcon className="size-6 shrink-0" />

                    <span
                      className={cn(
                        !isTabletOpen && 'max-lg:hidden',
                        isCollapsed && 'lg:hidden',
                      )}
                    >
                      {t('sidebar.logout')}
                    </span>
                  </button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
