'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-left text-sm leading-none font-regular select-none',
        'max-w-full overflow-x-auto overflow-y-hidden',
        'whitespace-nowrap',
        'scrollbar-none',
        'scrollbar-width-none',
        '[&::-webkit-scrollbar]:hidden',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
