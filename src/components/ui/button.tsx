import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[40px] border border-transparent bg-clip-padding text-sm font-medium leading-[24.5px] uppercase cursor-pointer tracking-[0.4px] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:border-primary hover:bg-transparent hover:text-primary active:border-primary active:bg-[var(--primary-active)] active:text-primary disabled:bg-[var(--disabled)] disabled:text-[var(--disabled-foreground)]',
        outline:
          'border-foreground bg-background hover:bg-muted/80 hover:text-foreground/80 aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:hover:bg-input/50',
        secondary:
          'border-[var(--secondary-border)] bg-transparent text-secondary-foreground dark:bg-secondary hover:bg-[var(--secondary-hover)] hover:text-[var(--secondary-hover-foreground)] dark:hover:bg-[var(--secondary-hover)] active:border-[var(--secondary-active-border)] active:bg-[var(--secondary-active)] active:text-[var(--secondary-active-foreground)] dark:active:bg-[var(--secondary-active)] active:shadow-[0_4px_4px_rgba(0,0,0,0.25)] disabled:border-transparent disabled:bg-[var(--disabled)] disabled:text-[var(--disabled-foreground)] dark:disabled:bg-[var(--disabled)]',
        ghost:
          'bg-transparent text-[var(--ghost-foreground)] hover:border-[var(--ghost-hover-border)] hover:bg-transparent active:border-[var(--ghost-active-border)] active:bg-[var(--ghost-active)] active:text-[var(--ghost-active-foreground)] disabled:bg-[var(--disabled)] disabled:text-[var(--disabled-foreground)]',
        primaryV2:
          'bg-transparent text-primary hover:border-primary hover:bg-transparent active:border-primary active:bg-[var(--primary-active)] active:text-primary disabled:bg-[var(--disabled)] disabled:text-[var(--disabled-foreground)]',
        icon: 'bg-transparent text-foreground hover:border-[var(--ghost-hover-border)] hover:bg-transparent active:border-[var(--icon-active-border)] active:bg-[var(--icon-active)] active:text-[var(--icon-active-foreground)] disabled:border-transparent disabled:bg-transparent disabled:text-[var(--disabled-foreground)]',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-12 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        icon: 'size-10',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants>;

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
