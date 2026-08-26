'use client';

import React, { useState } from 'react';
import { EyeIcon } from '@/components/icons/eye-icon';
import { EyeOffIcon } from '@/components/icons/eye-off-icon';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PasswordInputProps extends React.ComponentProps<'input'> {
  error?: string;
}

function PasswordInput({
  className,
  disabled,
  error,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        error={error}
        className={cn('pr-12', className)}
      />

      <Button
        type="button"
        variant="icon"
        disabled={disabled}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        onClick={() => setShowPassword(!showPassword)}
        className={cn(
          'absolute top-1/2 right-[6px] size-10 -translate-y-1/2 bg-transparent',
          error ? 'text-destructive' : 'text-[var(--password-icon)]',
          disabled && 'disabled:text-[#AEAEAE]',
        )}
      >
        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  );
}

export { PasswordInput };
