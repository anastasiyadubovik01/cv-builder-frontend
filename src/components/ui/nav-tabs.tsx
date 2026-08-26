'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavTabItem {
  key: string;
  label: string;
  href: string;
  exact?: boolean;
}

interface NavTabsProps extends React.HTMLAttributes<HTMLElement> {
  items: NavTabItem[];
}

export function NavTabs({ items, className, ...props }: NavTabsProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex h-12 items-center gap-1', className)} {...props}>
      {items.map((item) => {
        const isExact = item.exact ?? true;
        const isActive = isExact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative inline-flex h-12 w-[150px] items-center justify-center gap-1.5 uppercase transition-all',
              'text-[14px] font-medium leading-[18px] tracking-[0.4px] text-foreground whitespace-nowrap',
              'hover:text-destructive',
              'focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
              'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-destructive after:opacity-0 after:scale-x-0 after:transition-all',
              isActive &&
                'text-destructive after:opacity-100 after:scale-x-100',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
