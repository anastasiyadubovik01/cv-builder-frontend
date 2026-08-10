'use client';

import { useState } from 'react';
import { EyeIcon } from '@/components/icons/eye-icon';
import { EyeOffIcon } from '@/components/icons/eye-off-icon';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function PasswordInput({
  className,
  disabled,
  ...props
}: React.ComponentProps<'input'>) {
  const [showPassword, setShowPassword] = useState(false);

  const isInvalid =
    props['aria-invalid'] === true || props['aria-invalid'] === 'true';

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        className={cn('pr-12', className)}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowPassword(!showPassword)}
        className={cn(
          'absolute top-1/2 right-[6px] -translate-y-1/2 bg-transparent',
          isInvalid ? 'text-destructive' : 'text-[var(--password-icon)]',
          disabled && 'text-[var(--disabled-foreground)]',
        )}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

export { PasswordInput };
