'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  title: string;
  description: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorState({
  title,
  description,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="flex w-full max-w-[560px] flex-col items-center text-center">
        <Image
          src="/illustrations/error-light-theme.svg"
          alt=""
          width={160}
          height={120}
          loading="eager"
          className="dark:hidden"
        />

        <Image
          src="/illustrations/error-dark-theme.svg"
          alt=""
          width={160}
          height={120}
          loading="eager"
          className="hidden dark:block"
        />

        <h1 className="mt-4 text-[34px] leading-[42px] font-normal tracking-[0.25px] text-foreground">
          {title}
        </h1>

        <div className="mt-4 text-base leading-6 text-foreground">
          {description}
        </div>

        {actionLabel && onAction && (
          <Button
            type="button"
            onClick={onAction}
            className="mt-6 h-12 w-[220px]"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
