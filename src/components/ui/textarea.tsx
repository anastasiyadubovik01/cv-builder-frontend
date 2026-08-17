'use client';

import * as React from 'react';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  error?: string;
}

function Textarea({
  className,
  placeholder,
  error,
  value,
  ...props
}: TextareaProps) {
  const hasValue = value !== undefined && value !== '';

  return (
    <div className="relative">
      {placeholder && (hasValue || error) && (
        <Label
          className={cn(
            'absolute -top-4 left-2.5 px-1 text-xs',
            error && 'text-destructive',
          )}
        >
          {placeholder}
        </Label>
      )}
      <textarea
        data-slot="textarea"
        placeholder={placeholder}
        value={value}
        aria-invalid={!!error}
        className={cn(
          'h-[120px] w-full resize-none rounded-none border border-input bg-transparent px-3 pt-[14px] pb-3 text-[16px] font-normal leading-[23px] tracking-[0.15px] text-foreground transition-colors outline-none placeholder:text-base placeholder:text-muted-foreground hover:border-[var(--input-hover-border)] focus:border-[var(--input-active-border)] focus:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--input-disabled-border)] disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-foreground)] disabled:placeholder:text-[var(--input-disabled-foreground)] aria-invalid:border-destructive aria-invalid:bg-transparent aria-invalid:text-foreground aria-invalid:hover:border-destructive aria-invalid:focus:border-destructive aria-invalid:ring-0',
          className,
        )}
        {...props}
      />
      {error && (
        <Label className="absolute -bottom-4 left-2.5 px-1 text-xs text-destructive">
          {error}
        </Label>
      )}
    </div>
  );
}

export { Textarea };
