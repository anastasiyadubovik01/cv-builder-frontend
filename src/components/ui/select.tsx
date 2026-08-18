'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Label } from './label';

import { cn } from '@/lib/utils';

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1', className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex flex-1 text-left', className)}
      {...props}
    />
  );
}

type SelectTriggerProps = SelectPrimitive.Trigger.Props & {
  label?: string;
};

function SelectTrigger({
  className,
  children,
  label,
  ...props
}: SelectTriggerProps) {
  return (
    <div className="relative">
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        className={cn(
          [
            'peer group flex h-12 w-full items-center justify-between',
            'rounded-none border border-[var(--select-border)]',
            'bg-[var(--select-background)] px-3',
            'text-[16px] leading-[23px] font-normal tracking-[0.15px]',
            'text-[var(--select-foreground)]',
            'outline-none transition-colors',

            'data-placeholder:text-[var(--select-placeholder)]',

            'hover:border-[var(--select-border-hover)]',

            'data-[popup-open]:border-[var(--select-border-active)]',

            'aria-invalid:border-[var(--select-invalid)]',
            'aria-invalid:bg-[var(--select-invalid-background)]',

            'data-[disabled]:cursor-not-allowed',
            'data-[disabled]:border-[var(--select-disabled-border)]',
            'data-[disabled]:bg-[var(--select-disabled-background)]',
            'data-[disabled]:text-[var(--select-disabled-foreground)]',
            'data-[disabled]:hover:border-[var(--select-disabled-border)]',
          ],
          className,
        )}
        {...props}
      >
        {children}

        <SelectPrimitive.Icon
          render={
            <ChevronDownIcon
              className={cn(
                'size-6 shrink-0 text-[var(--select-icon)] transition-transform',
                'group-data-[popup-open]:rotate-180',
                'group-aria-invalid:text-[var(--select-invalid)]',
                'group-data-[disabled]:text-[var(--select-disabled-foreground)]',
              )}
            />
          }
        />
      </SelectPrimitive.Trigger>

      {label && (
        <Label
          className={cn(
            'pointer-events-none absolute -top-4 left-2.5 px-1 text-xs',
            'peer-data-[placeholder]:hidden',
            'peer-aria-invalid:block peer-aria-invalid:text-destructive',
          )}
        >
          {label}
        </Label>
      )}
    </div>
  );
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 0,
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            [
              'relative z-50',
              'max-h-(--available-height)',
              'w-(--anchor-width)',
              'overflow-x-hidden overflow-y-auto',
              'rounded-none',
              'border border-t-0 border-[var(--select-border-active)]',
              'bg-[var(--select-background)]',
              'text-[var(--select-foreground)]',
              'shadow-none ring-0',
            ],
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />

          <SelectPrimitive.List>{children}</SelectPrimitive.List>

          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        'px-3 py-1 text-[14px] text-[var(--select-placeholder)]',
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        [
          'flex h-[47px] w-full cursor-default items-center',
          'rounded-none px-3',
          'text-[16px] leading-[23px] font-normal tracking-[0.15px]',
          'text-[var(--select-foreground)]',
          'outline-none select-none',

          // Hover option
          'data-[highlighted]:bg-[var(--select-option-hover-background)]',
          'data-[highlighted]:text-[var(--select-option-hover-foreground)]',

          // Selected option
          'data-[selected]:bg-[var(--select-option-selected-background)]',
          'data-[selected]:text-[var(--select-option-selected-foreground)]',

          // Disabled option
          'data-[disabled]:pointer-events-none',
          'data-[disabled]:opacity-50',
        ],
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('h-px bg-[var(--select-border-active)]', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        'flex w-full cursor-default items-center justify-center',
        'bg-[var(--select-background)] py-1',
        'text-[var(--select-icon)]',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        'flex w-full cursor-default items-center justify-center',
        'bg-[var(--select-background)] py-1',
        'text-[var(--select-icon)]',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
