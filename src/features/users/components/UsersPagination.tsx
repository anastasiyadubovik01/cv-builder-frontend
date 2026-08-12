import { ChevronLeftIcon } from '@/components/icons/chevron-left-icon';

type UsersPaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 2) {
    return [1, 2, 'ellipsis-right', totalPages];
  }

  if (currentPage >= totalPages - 1) {
    return [1, 'ellipsis-left', totalPages - 1, totalPages];
  }

  return [1, 'ellipsis-left', currentPage, 'ellipsis-right', totalPages];
}

export function UsersPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: UsersPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPaginationItems(currentPage, totalPages);

  return (
    <div className="mt-2 flex h-9 items-center justify-center gap-2 text-[var(--pagination-text)]">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className="flex size-9 items-center justify-center text-[var(--pagination-arrow)] disabled:opacity-40"
      >
        <ChevronLeftIcon className="size-6" />
      </button>

      {pages.map((page) =>
        typeof page === 'string' ? (
          <span key={page} className="flex size-9 items-center justify-center">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`
              flex size-9 items-center justify-center rounded-full border text-base
              ${
                currentPage === page
                  ? 'border-[var(--pagination-arrow)]'
                  : 'border-[var(--pagination-border)]'
              }
            `}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className="flex size-9 items-center justify-center text-[var(--pagination-arrow)] disabled:opacity-40"
      >
        <ChevronLeftIcon className="size-6 rotate-180" />
      </button>

      <div className="relative ml-8 h-9 w-[70px]">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-full w-full appearance-none border border-[var(--pagination-border)] bg-background px-3 text-base text-[var(--pagination-text)] outline-none"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <ChevronLeftIcon className="pointer-events-none absolute top-1/2 right-2 size-6 -translate-y-1/2 -rotate-90 text-[var(--pagination-arrow)]" />
      </div>
    </div>
  );
}
