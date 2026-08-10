import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'h-[120px] w-full resize-none rounded-none border border-input bg-transparent px-3 pt-[14px] pb-3 text-sm font-normal leading-[23px] tracking-[0.15px] text-foreground transition-colors outline-none placeholder:text-base placeholder:text-muted-foreground hover:border-[var(--input-hover-border)] focus:border-[var(--input-active-border)] focus:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--input-disabled-border)] disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-foreground)] disabled:placeholder:text-[var(--input-disabled-foreground)]',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
