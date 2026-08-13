'use client';

import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { Label } from './label';
import { cn } from '@/lib/utils';

interface InputProps extends React.ComponentProps<'input'> {
  error?: string;
  containerClassName?: string;
  floatingLabel?: boolean;
}

function Input({
  className,
  containerClassName,
  floatingLabel = true,
  type,
  placeholder,
  error,
  value,
  ...props
}: InputProps) {
  const hasValue = value !== undefined && value !== '';

  return (
    <div className={cn('relative', containerClassName)}>
      {floatingLabel && placeholder && (hasValue || error) && (
        <Label
          className={cn(
            'absolute -top-4 left-2.5 bg-background px-1 text-xs',
            error && 'text-destructive',
          )}
        >
          {placeholder}
        </Label>
      )}
      <InputPrimitive
        type={type}
        data-slot="input"
        placeholder={placeholder}
        value={value}
        aria-invalid={!!error}
        className={cn(
          'h-12 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-base font-normal leading-[23px] tracking-[0.15px] text-foreground transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-[var(--input-hover-border)] focus:border-[var(--input-active-border)] focus:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--input-disabled-border)] disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-foreground)] disabled:text-sm aria-invalid:border-destructive aria-invalid:bg-transparent aria-invalid:text-foreground aria-invalid:hover:border-destructive aria-invalid:focus:border-destructive aria-invalid:ring-0',
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

export { Input };
