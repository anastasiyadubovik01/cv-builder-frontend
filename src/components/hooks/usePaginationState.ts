'use client';

import { useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/pagination';

export interface UsePaginationStateResult {
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPagination: () => void;
}

export function usePaginationState(
  initialPageSize: number = DEFAULT_PAGE_SIZE,
): UsePaginationStateResult {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    resetPagination,
  };
}
