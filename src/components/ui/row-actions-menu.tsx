'use client';

import Link from 'next/link';

import { MoreVerticalIcon } from '@/components/icons/more-vertical-icon';
import { Button } from '@/components/ui/button';

type RowAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type RowActionsMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ariaLabel: string;
  actions: RowAction[];
};

export function RowActionsMenu({
  open,
  onOpenChange,
  ariaLabel,
  actions,
}: RowActionsMenuProps) {
  return (
    <div
      className="relative flex justify-end pr-4"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onOpenChange(false);
        }
      }}
    >
      <Button
        variant="icon"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex size-8 cursor-pointer items-center justify-center"
      >
        <MoreVerticalIcon className="size-6 text-[#626262] dark:text-[#F5F5F7]" />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-4 top-8 z-30 w-[140px] overflow-hidden rounded-[12px] border border-[#AEAEAE] bg-[#E7E7E9] py-1 shadow-sm dark:border-[#626262] dark:bg-[#3A3A3C]"
        >
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                role="menuitem"
                onClick={() => onOpenChange(false)}
                className="block px-5 py-2.5 text-[16px] leading-6 text-[#2E2E2E] hover:bg-black/5 dark:text-[#F5F5F7] dark:hover:bg-white/10"
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  action.onClick?.();
                  onOpenChange(false);
                }}
                className="block w-full cursor-pointer px-5 py-2.5 text-left text-[16px] leading-6 text-[#2E2E2E] hover:bg-black/5 dark:text-[#F5F5F7] dark:hover:bg-white/10"
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
