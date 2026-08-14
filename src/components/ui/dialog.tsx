'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-black/60 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  size = 'default',
  ...props
}: DialogPrimitive.Popup.Props & {
  size?: 'default' | 'sm';
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid w-full min-w-[620px] gap-[26px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-secondary p-6 pt-4 pb-4 text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      />
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'relative grid grid-rows-[auto_1fr] place-items-start has-data-[slot=dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=dialog-media]:gap-x-4 sm:group-data-[size=default]/dialog-content:place-items-start sm:group-data-[size=default]/dialog-content:text-left sm:group-data-[size=default]/dialog-content:has-data-[slot=dialog-media]:grid-rows-[auto_1fr]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        '-mx-4 -mb-4 flex flex-col-reverse gap-6 rounded-b-xl p-4 pt-0 group-data-[size=sm]/dialog-content:grid group-data-[size=sm]/dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

function DialogMedia({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-md bg-muted sm:group-data-[size=default]/dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'font-heading text-[20px] font-medium sm:group-data-[size=default]/dialog-content:group-has-data-[slot=dialog-media]/dialog-content:col-start-2',
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-sm text-balance text-[16px] text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function DialogCloseButton({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close-button"
      className={cn(
        'absolute right-0 top-0 inline-flex size-6 items-center justify-center translate-y-1/6',
        className,
      )}
      render={
        <Button
          variant="icon"
          size="icon-xs"
          className="size-6 p-0 rounded-full"
        >
          <XIcon className="size-5" />
          <span className="sr-only">Close</span>
        </Button>
      }
      {...props}
    />
  );
}

function DialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="dialog-action"
      className={cn('w-[160px] h-[48px]', className)}
      {...props}
    />
  );
}

function DialogCancel({
  className,
  variant = 'secondary',
  size = 'default',
  ...props
}: DialogPrimitive.Close.Props &
  Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-cancel"
      className={cn('w-[160px] h-[48px]', className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogCloseButton,
  DialogAction,
  DialogCancel,
};
