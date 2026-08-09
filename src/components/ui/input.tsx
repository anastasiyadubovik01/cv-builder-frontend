import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-12 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-base font-normal leading-[23px] tracking-[0.15px] text-foreground transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-[var(--input-hover-border)] focus:border-[var(--input-active-border)] focus:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--input-disabled-border)] disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-foreground)] disabled:text-sm aria-invalid:border-destructive aria-invalid:bg-transparent aria-invalid:text-foreground aria-invalid:hover:border-destructive aria-invalid:focus:border-destructive aria-invalid:ring-0',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
