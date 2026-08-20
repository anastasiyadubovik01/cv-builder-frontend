'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';
import { Label } from './label';
import { RemovableBadge } from './removable-badge';
import { cn } from '@/lib/utils';

export type Option = {
  value: string;
  label: string;
};

export interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder,
  label,
  error,
  disabled,
  className,
  containerClassName,
}: MultiSelectProps) {
  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <SelectPrimitive.Root
      multiple
      value={value}
      onValueChange={(val) => onChange(val as string[])}
      disabled={disabled}
    >
      <div className={cn('relative', containerClassName)}>
        {label && (
          <Label
            className={cn(
              'pointer-events-none absolute -top-4 left-2.5 z-10 px-1 text-xs',
              value.length === 0 && 'hidden',
              error
                ? 'text-destructive'
                : 'peer-aria-invalid:block peer-aria-invalid:text-destructive',
            )}
          >
            {label}
          </Label>
        )}

        <SelectPrimitive.Trigger
          data-slot="select-trigger"
          aria-invalid={Boolean(error)}
          nativeButton={false}
          render={<div />}
          className={cn(
            [
              'peer group flex min-h-12 w-full cursor-pointer items-center justify-between gap-2',
              'rounded-none border border-input bg-transparent',
              'p-2 px-3',
              'text-[16px] font-normal leading-[23px] tracking-[0.15px]',
              'text-foreground',
              'outline-none transition-colors',

              // Hover
              'hover:border-[var(--input-hover-border)]',

              // Active
              'data-[popup-open]:border-[var(--input-active-border)]',

              // Invalid State
              'aria-invalid:border-destructive',
              'aria-invalid:bg-transparent',
              'aria-invalid:hover:border-destructive',

              // Disabled State
              'data-[disabled]:pointer-events-none',
              'data-[disabled]:cursor-not-allowed',
              'data-[disabled]:border-[var(--input-disabled-border)]',
              'data-[disabled]:bg-[var(--input-disabled-bg)]',
              'data-[disabled]:text-[var(--input-disabled-foreground)]',
              'data-[disabled]:hover:border-[var(--input-disabled-border)]',
            ],
            className,
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <RemovableBadge
                  key={opt.value}
                  label={opt.label}
                  onRemove={() => handleRemove(opt.value)}
                  disabled={disabled}
                />
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>

          <SelectPrimitive.Icon
            render={
              <ChevronDownIcon
                className={cn(
                  'size-6 shrink-0 text-muted-foreground transition-transform',
                  'group-data-[popup-open]:rotate-180',
                  'group-aria-invalid:text-destructive',
                  'group-data-[disabled]:text-[var(--input-disabled-foreground)]',
                )}
              />
            }
          />
        </SelectPrimitive.Trigger>

        {error && (
          <Label className="pointer-events-none absolute -bottom-4 left-2.5 px-1 text-xs text-destructive">
            {error}
          </Label>
        )}
      </div>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={0}
          align="start"
          className="isolate z-50"
        >
          <SelectPrimitive.Popup
            data-slot="select-content"
            className={cn(
              'relative z-50 max-h-(--available-height) w-(--anchor-width) overflow-x-hidden overflow-y-auto',
              'rounded-none border border-t-0 border-[var(--input-active-border)]',
              'bg-background text-foreground shadow-none ring-0',
            )}
          >
            <SelectPrimitive.List>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    data-selected={isSelected || undefined}
                    onClick={() => handleToggleOption(option.value)}
                    className={cn(
                      'flex h-[47px] w-full select-none cursor-default items-center gap-3 rounded-none px-3 text-[16px] font-normal leading-[23px] tracking-[0.15px] outline-none transition-colors',
                      'text-foreground',
                      'data-[highlighted]:bg-[var(--select-option-hover-background)] data-[highlighted]:text-[var(--select-option-hover-foreground)]',
                      'data-[selected]:bg-[var(--select-option-selected-background)] data-[selected]:text-[var(--select-option-selected-foreground)]',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center border transition-colors',
                        isSelected
                          ? 'border-[var(--select-option-selected-foreground)] bg-transparent text-[var(--select-option-selected-foreground)]'
                          : 'border-input bg-transparent',
                      )}
                    >
                      {isSelected && (
                        <CheckIcon className="size-3.5 stroke-[3]" />
                      )}
                    </div>
                    <SelectPrimitive.ItemText>
                      {option.label}
                    </SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
