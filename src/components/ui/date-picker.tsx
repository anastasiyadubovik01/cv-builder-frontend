'use client';

import * as React from 'react';
import { format, parseISO } from 'date-fns';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from '@/components/icons/calendar-icon';

interface DatePickerProps {
  value?: string;
  onChange: (dateString: string) => void;
  onBlur?: () => void;
  placeholder: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const wasOpenRef = React.useRef(false);
  const selectedDate = value ? parseISO(value) : undefined;
  const formattedValue = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const handleSelect = (date?: Date) => {
    const newValue = date ? format(date, 'yyyy-MM-dd') : '';
    onChange(newValue);
    if (open) {
      wasOpenRef.current = true;
    }
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  React.useEffect(() => {
    if (!open && wasOpenRef.current) {
      onBlur?.();
      wasOpenRef.current = false;
    }
  }, [open, onBlur]);

  React.useEffect(() => {
    if (open) {
      wasOpenRef.current = false;
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <div className={cn('relative w-full cursor-pointer', className)}>
          <Input
            value={formattedValue}
            placeholder={placeholder}
            readOnly
            required={required}
            error={error}
            className="pr-10 cursor-pointer"
          />
          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[#626262] dark:text-[#AEAEAE] pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
