import type { ComponentType, SVGProps } from 'react';
import Link from 'next/link';

import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';
import { cn } from '@/lib/utils';

type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  accent?: boolean;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="h-14 px-5 py-4">
      <ol className="flex w-fit items-center gap-2 text-base leading-6 tracking-[0.15px]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          const itemClassName = cn(
            'flex items-center gap-2',
            item.accent
              ? 'text-destructive'
              : 'text-[var(--breadcrumbs-foreground)]',
          );

          const content = (
            <>
              {Icon && <Icon className="size-6 shrink-0" strokeWidth={2} />}

              <span>{item.label}</span>
            </>
          );

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              {item.href && !isLast ? (
                <Link href={item.href} className={itemClassName}>
                  {content}
                </Link>
              ) : (
                <span
                  className={itemClassName}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {content}
                </span>
              )}

              {!isLast && (
                <ChevronLeftIcon className="size-5 rotate-180 text-[#AEAEAE]" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
