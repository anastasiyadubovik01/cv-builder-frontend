'use client';

import * as React from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

interface DigitsInputOTPProps {
  maxLength?: number;
  pattern?: string;
  className?: string;
}

function DigitsInputOTP({
  maxLength = 6,
  pattern = REGEXP_ONLY_DIGITS,
  className,
}: DigitsInputOTPProps) {
  return (
    <div className={cn('flex justify-center', className)}>
      <InputOTP maxLength={maxLength} pattern={pattern}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

export { DigitsInputOTP };
