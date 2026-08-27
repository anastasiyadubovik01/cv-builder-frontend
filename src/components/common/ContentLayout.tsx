'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { QueryErrorState } from '@/components/common/QueryErrorState';

export interface ContentLayoutProps {
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;

  search?: string;
  onSearchChange?: (value: string) => void;

  actionTrigger?: ReactNode;

  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };

  children: ReactNode;
}

export function ContentLayout({
  isLoading = false,
  hasError = false,
  errorMessage,
  onRetry,
  search = '',
  onSearchChange,
  actionTrigger,
  pagination,
  children,
}: ContentLayoutProps) {
  const { t } = useTranslation();
  const showHeader = onSearchChange !== undefined || Boolean(actionTrigger);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col overflow-hidden">
      {!hasError && isLoading && <LoadingOverlay />}

      {showHeader && (
        <div className="mx-6 mt-[7px] flex shrink-0 items-center justify-between">
          {onSearchChange ? (
            <SearchInput
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('common.search', 'Search')}
              className="bg-background"
            />
          ) : (
            <div />
          )}
          {actionTrigger}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4">
        {hasError ? (
          <QueryErrorState
            message={
              errorMessage ?? t('common.loadError', 'Failed to load data')
            }
            onRetry={onRetry}
          />
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              {children}
            </div>

            {pagination && (
              <div className="shrink-0 bg-background pb-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.pageSize}
                  onPageChange={pagination.onPageChange}
                  onPageSizeChange={pagination.onPageSizeChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
