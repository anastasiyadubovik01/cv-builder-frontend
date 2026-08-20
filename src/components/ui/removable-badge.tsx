'use client';

import * as React from 'react';
import { XIcon } from 'lucide-react';
import { Badge, type badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export interface RemovableBadgeProps
  extends
    React.ComponentProps<typeof Badge>,
    VariantProps<typeof badgeVariants> {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
}

export function RemovableBadge({
  label,
  onRemove,
  disabled,
  className,
  variant = 'outline',
  ...props
}: RemovableBadgeProps) {
  const handleRemove = (
    e: React.MouseEvent | React.KeyboardEvent | React.SyntheticEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if ('nativeEvent' in e && e.nativeEvent.stopImmediatePropagation) {
      e.nativeEvent.stopImmediatePropagation();
    }
    if (!disabled && onRemove) {
      onRemove();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleRemove(e);
    }
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5 pr-[6px] font-normal transition-colors',
        disabled && 'opacity-50 pointer-events-none',
        className,
      )}
      {...props}
    >
      <span>{label}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleRemove}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'inline-flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-full bg-[#AEAEAE] hover:bg-[#AEAEAE]/80 focus:outline-none cursor-pointer transition-colors',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          aria-label={`Remove ${label}`}
        >
          <XIcon className="size-2 text-[#F5F5F7] dark:text-[#454545]" />
        </span>
      )}
    </Badge>
  );
}
