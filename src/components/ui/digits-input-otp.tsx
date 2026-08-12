'use client';

import * as React from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DigitsInputOTPProps {
  maxLength?: number;
  pattern?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

function DigitsInputOTP({
  maxLength = 6,
  pattern = REGEXP_ONLY_DIGITS,
  className,
  value,
  onChange,
  disabled,
  error,
}: DigitsInputOTPProps) {
  return (
    <div className={cn('relative flex justify-center', className)}>
      <InputOTP
        maxLength={maxLength}
        pattern={pattern}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      {error && (
        <Label className="absolute -bottom-6 text-center text-xs text-destructive">
          {error}
        </Label>
      )}
    </div>
  );
}

export { DigitsInputOTP };
